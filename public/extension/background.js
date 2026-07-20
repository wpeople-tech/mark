var g = { CEB_API_BASE: "https://markintel.tech" };
const y = g.CEB_API_BASE, w = `${y}/api/forge`, k = `${y}/api/opportunities`, l = {
  status: "idle",
  lines: [],
  tags: [],
  skills: [],
  markFile: "",
  zipBase64: "",
  repoName: "",
  ideas: [],
  remaining: 5
};
chrome.runtime.onMessage.addListener((e, a, t) => {
  if (console.log("[MARK Background] Message received:", e.type, e.owner ? `${e.owner}/${e.repo}` : ""), e.type === "START_SCAN")
    return T(e.owner, e.repo).then(() => t({ ok: !0 })), !0;
  if (e.type === "RESET_STATE" && (chrome.storage.local.set({ scanState: l }), t({ ok: !0 })), e.type === "RETRY_OPPORTUNITIES")
    return _().then(() => t({ ok: !0 })), !0;
});
async function T(e, a) {
  await chrome.storage.local.set({
    scanState: { ...l, status: "scanning", repoName: `${e}/${a}` }
  }), i({ type: "SCAN_STARTED" });
  try {
    const t = await fetch(w, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: e, repo: a })
    });
    if (t.status === 429) {
      await r({ status: "rate_limited", remaining: 0 }), i({ type: "RATE_LIMITED" });
      return;
    }
    if (!t.ok)
      throw new Error(`HTTP ${t.status}`);
    const u = t.body.getReader(), s = new TextDecoder();
    let o = "", p = "";
    for (; ; ) {
      const { done: f, value: m } = await u.read();
      if (f) break;
      o += s.decode(m, { stream: !0 });
      const E = o.split(`
`);
      o = E.pop() || "";
      for (const d of E)
        if (d.startsWith("data: "))
          try {
            const c = JSON.parse(d.slice(6));
            await h(c), c.type === "content" && (p += c.text);
          } catch {
          }
    }
    S(p, `${e}/${a}`);
  } catch (t) {
    await r({
      status: "error",
      error: t.message ?? "Scan failed. Please try again."
    }), i({ type: "SCAN_ERROR", error: t.message });
  }
}
async function h(e) {
  const a = await n();
  switch (e.type) {
    case "status":
      await r({
        remaining: e.remaining ?? a.remaining,
        lines: [
          ...a.lines,
          { type: "status", text: e.message, cls: "blue" }
        ]
      });
      break;
    case "stack":
      await r({ tags: e.tags });
      break;
    case "skills":
      await r({ skills: e.skills });
      break;
    case "content":
      await r({ markFile: a.markFile + e.text });
      break;
    case "done":
      await r({
        status: "done",
        zipBase64: e.zipBase64,
        markFile: e.markFile,
        tags: e.tags,
        skills: e.skills,
        remaining: e.remaining ?? a.remaining,
        lines: [
          ...a.lines,
          { type: "done", text: "→ Complete ✓", cls: "green" }
        ]
      });
      break;
    case "error":
      await r({ status: "error", error: e.message });
      break;
  }
  i({ type: "STATE_UPDATE", data: e });
}
async function S(e, a) {
  try {
    const t = await n(), s = await (await fetch(k, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markFile: e, repoName: a, stack: t.tags })
    })).json();
    if (s.error) {
      await r({ ideasError: `Failed: ${s.error}` }), i({ type: "IDEAS_ERROR", error: s.error });
      return;
    }
    await r({ ideas: s.ideas, ideasError: void 0 }), i({ type: "IDEAS_READY", ideas: s.ideas });
  } catch (t) {
    await r({ ideasError: (t == null ? void 0 : t.message) ?? "Failed to generate opportunities" }), i({ type: "IDEAS_ERROR", error: t == null ? void 0 : t.message });
  }
}
async function _() {
  const e = await n();
  !e.markFile || !e.repoName || (await r({ ideasError: void 0 }), await S(e.markFile, e.repoName));
}
async function n() {
  return (await chrome.storage.local.get("scanState")).scanState ?? l;
}
async function r(e) {
  const a = await n();
  await chrome.storage.local.set({ scanState: { ...a, ...e } });
}
function i(e) {
  chrome.runtime.sendMessage(e).catch(() => {
  });
}
