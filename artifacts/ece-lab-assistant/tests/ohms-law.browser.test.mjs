import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const artifactRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const staticRoot = join(artifactRoot, "dist", "public");
const chromiumPath = process.env.CHROMIUM_PATH || "/repl/tools/bin/chromium";

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function startStaticServer() {
  const server = createServer(async (request, response) => {
    const requestedPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
    const filePath = normalize(join(staticRoot, relativePath));

    if (!filePath.startsWith(`${staticRoot}/`) || !existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    });
    response.end(await readFile(filePath));
  });

  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveServer({ server, port: address.port });
    });
  });
}

class DevToolsClient {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 0;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolveConnection, rejectConnection) => {
      this.socket.addEventListener("open", resolveConnection, { once: true });
      this.socket.addEventListener("error", rejectConnection, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;

      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolveResponse, rejectResponse) => {
      this.pending.set(id, { resolve: resolveResponse, reject: rejectResponse });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }

    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

async function waitForBrowserEndpoint(process) {
  const endpointUrl = "http://127.0.0.1:9222/json/list";

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (process.exitCode !== null) {
      throw new Error(`Chromium exited before opening its debugging port (${process.exitCode}).`);
    }

    try {
      const response = await fetch(endpointUrl);
      if (response.ok) {
        const pages = await response.json();
        const page = pages.find((target) => target.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chromium is still starting.
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
  }

  throw new Error("Timed out waiting for Chromium's debugging endpoint.");
}

async function waitForPage(client) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await client.evaluate("document.readyState === 'complete'")) return;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
  }

  throw new Error("Timed out waiting for the static artifact to load.");
}

async function setInput(client, inputId, value) {
  const serializedValue = JSON.stringify(String(value));
  await client.evaluate(`
    (() => {
      const input = document.querySelector("#${inputId}");
      input.value = ${serializedValue};
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()
  `);
}

async function selectSolveFor(client, value) {
  await client.evaluate(`
    document.querySelector('input[name="solve-for"][value="${value}"]').click()
  `);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 10));
}

async function submit(client) {
  await client.evaluate('document.querySelector("#ohms-law-form").requestSubmit()');
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 10));
}

async function clearCalculator(client) {
  await client.evaluate('document.querySelector(".reset-button").click()');
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
}

async function readCalculatorState(client) {
  return client.evaluate(`({
    result: document.querySelector("#result-value").textContent,
    formula: document.querySelector("#result-formula").textContent,
    message: document.querySelector("#calculator-message").textContent,
    errors: {
      voltage: document.querySelector("#voltage-error").textContent,
      current: document.querySelector("#current-error").textContent,
      resistance: document.querySelector("#resistance-error").textContent
    }
  })`);
}

function checkState(state, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(state[key], value, `${label}: expected ${key} to be "${value}"`);
  }
}

async function runBrowserTests() {
  const { server, port } = await startStaticServer();
  const browser = spawn(chromiumPath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--user-data-dir=/tmp/ece-lab-assistant-browser-test",
    "--remote-debugging-port=9222",
    "about:blank",
  ], { stdio: "ignore" });

  let client;
  try {
    const webSocketUrl = await waitForBrowserEndpoint(browser);
    client = new DevToolsClient(webSocketUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
    await waitForPage(client);

    await submit(client);
    checkState(
      await readCalculatorState(client),
      {
        message: "Check the highlighted values before calculating.",
      },
      "empty values",
    );
    const emptyState = await readCalculatorState(client);
    assert.equal(emptyState.errors.current, "Enter a value for current.", "empty values: current error");
    assert.equal(emptyState.errors.resistance, "Enter a value for resistance.", "empty values: resistance error");

    await setInput(client, "current-input", "not-a-number");
    await setInput(client, "resistance-input", "10");
    await submit(client);
    const nonNumericState = await readCalculatorState(client);
    assert.equal(nonNumericState.errors.current, "Use a valid number, such as 12 or 0.5.", "non-numeric input");
    assert.equal(nonNumericState.message, "Check the highlighted values before calculating.", "non-numeric input");

    await setInput(client, "current-input", "0");
    await submit(client);
    assert.equal(
      (await readCalculatorState(client)).errors.current,
      "Enter a value greater than zero.",
      "zero input",
    );

    await setInput(client, "current-input", "-2");
    await submit(client);
    assert.equal(
      (await readCalculatorState(client)).errors.current,
      "Enter a value greater than zero.",
      "negative input",
    );

    await setInput(client, "current-input", "0.5");
    await setInput(client, "resistance-input", "12");
    await submit(client);
    checkState(
      await readCalculatorState(client),
      {
        result: "Voltage = 6 V",
        formula: "V = I × R",
        message: "Calculation complete.",
      },
      "voltage calculation with decimal input",
    );

    await selectSolveFor(client, "current");
    await setInput(client, "voltage-input", "12");
    await setInput(client, "resistance-input", "24");
    await submit(client);
    checkState(
      await readCalculatorState(client),
      {
        result: "Current = 0.5 A",
        formula: "I = V ÷ R",
        message: "Calculation complete.",
      },
      "current calculation",
    );

    await selectSolveFor(client, "resistance");
    await setInput(client, "voltage-input", "12");
    await setInput(client, "current-input", "0.5");
    await submit(client);
    checkState(
      await readCalculatorState(client),
      {
        result: "Resistance = 24 Ω",
        formula: "R = V ÷ I",
        message: "Calculation complete.",
      },
      "resistance calculation",
    );

    console.log("Ohm's Law browser tests passed.");
  } finally {
    client?.close();
    browser.kill();
    server.close();
  }
}

runBrowserTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});