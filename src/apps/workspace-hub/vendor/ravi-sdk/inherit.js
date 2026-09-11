import { RaviClient } from "./client.js";
import { createHttpTransport } from "./transport/http.js";
export async function createInheritedClient(options = {}) {
    const env = options.env ?? defaultEnv();
    const baseUrl = resolveInheritedBaseUrl(env, options.baseUrl);
    const contextKey = resolveInheritedContextKey(env, options.contextKey);
    const parent = new RaviClient(createHttpTransport(httpConfig(options, baseUrl, contextKey)));
    if (!options.child) {
        return { client: parent, baseUrl, mode: "current" };
    }
    const issueInput = buildChildIssueInput(options.child);
    const issued = await parent.context.issue(issueInput.cliName, {
        ...(issueInput.allow ? { allow: issueInput.allow } : {}),
        ...(issueInput.inherit !== undefined ? { inherit: issueInput.inherit } : {}),
        ...(issueInput.ttl ? { ttl: issueInput.ttl } : {}),
    });
    const child = new RaviClient(createHttpTransport(httpConfig(options, baseUrl, issued.contextKey)));
    return {
        client: child,
        baseUrl,
        mode: "child",
        contextId: issued.contextId,
        revoke: async (reason = "createInheritedClient child context cleanup") => {
            await parent.context.revoke(issued.contextId, { reason });
        },
    };
}
export function resolveInheritedBaseUrl(env = defaultEnv(), explicit) {
    const direct = firstNonEmpty(explicit, env.RAVI_BASE_URL, env.RAVI_HTTP_BASE_URL, env.RAVI_GATEWAY_URL);
    if (direct)
        return normalizeBaseUrl(direct);
    const port = firstNonEmpty(env.RAVI_HTTP_PORT, env.RAVI_WEBHOOK_PORT);
    if (port) {
        const host = normalizeHost(firstNonEmpty(env.RAVI_HTTP_HOST, env.RAVI_WEBHOOK_HOST) ?? "127.0.0.1");
        return normalizeBaseUrl(`http://${host}:${port}`);
    }
    throw new Error("createInheritedClient: missing Ravi gateway URL. Set RAVI_BASE_URL, RAVI_GATEWAY_URL, or RAVI_HTTP_HOST/RAVI_HTTP_PORT.");
}
export function resolveInheritedContextKey(env = defaultEnv(), explicit) {
    const contextKey = firstNonEmpty(explicit, env.RAVI_CONTEXT_KEY);
    if (!contextKey) {
        throw new Error("createInheritedClient: missing Ravi runtime context. Set RAVI_CONTEXT_KEY or pass contextKey.");
    }
    return contextKey;
}
function buildChildIssueInput(child) {
    const cliName = firstNonEmpty(child.cliName);
    if (!cliName) {
        throw new Error("createInheritedClient: child mode requires a non-empty cliName.");
    }
    const allow = firstNonEmpty(child.allow);
    const ttl = firstNonEmpty(child.ttl);
    if (!allow && child.inherit !== true) {
        throw new Error("createInheritedClient: child mode requires child.inherit === true or a non-empty child.allow.");
    }
    return {
        cliName,
        ...(allow ? { allow } : {}),
        ...(child.inherit !== undefined ? { inherit: child.inherit } : {}),
        ...(ttl ? { ttl } : {}),
    };
}
function httpConfig(options, baseUrl, contextKey) {
    return {
        baseUrl,
        contextKey,
        ...(options.fetch ? { fetch: options.fetch } : {}),
        ...(options.headers ? { headers: options.headers } : {}),
        ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
    };
}
function defaultEnv() {
    const runtime = globalThis;
    return runtime.process?.env ?? {};
}
function firstNonEmpty(...values) {
    for (const value of values) {
        const trimmed = value?.trim();
        if (trimmed)
            return trimmed;
    }
    return undefined;
}
function normalizeBaseUrl(value) {
    const trimmed = value.trim().replace(/\/+$/, "");
    try {
        return new URL(trimmed).toString().replace(/\/+$/, "");
    }
    catch {
        throw new Error(`createInheritedClient: invalid Ravi gateway URL: ${value}`);
    }
}
function normalizeHost(value) {
    const host = value.trim();
    if (host === "0.0.0.0" || host === "::")
        return "127.0.0.1";
    if (host.includes(":") && !host.startsWith("[") && !host.endsWith("]"))
        return `[${host}]`;
    return host;
}
//# sourceMappingURL=inherit.js.map