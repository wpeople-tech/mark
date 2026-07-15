var k = { CEB_API_BASE: "https://mark-orpin.vercel.app" };
const f = k.CEB_API_BASE, w = `${f}/api/forge`, T = `${f}/api/opportunities`, l = {
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
chrome.runtime.onMessage.addListener((e, t, a) => {
  if (console.log("[MARK Background] Message received:", e.type, e.owner ? `${e.owner}/${e.repo}` : ""), e.type === "START_SCAN")
    return E(e.owner, e.repo).then(() => a({ ok: !0 })), !0;
  e.type === "RESET_STATE" && (chrome.storage.local.set({ scanState: l }), a({ ok: !0 }));
});
async function E(e, t) {
  await chrome.storage.local.set({
    scanState: { ...l, status: "scanning", repoName: `${e}/${t}` }
  }), r({ type: "SCAN_STARTED" });
  try {
    const a = await fetch(w, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: e, repo: t })
    });
    if (a.status === 429) {
      await s({ status: "rate_limited", remaining: 0 }), r({ type: "RATE_LIMITED" });
      return;
    }
    if (!a.ok)
      throw new Error(`HTTP ${a.status}`);
    const i = a.body.getReader(), n = new TextDecoder();
    let o = "", p = "";
    for (; ; ) {
      const { done: y, value: m } = await i.read();
      if (y) break;
      o += n.decode(m, { stream: !0 });
      const S = o.split(`
`);
      o = S.pop() || "";
      for (const g of S)
        if (g.startsWith("data: "))
          try {
            const c = JSON.parse(g.slice(6));
            await d(c), c.type === "content" && (p += c.text);
          } catch {
          }
    }
    h(p, `${e}/${t}`);
  } catch (a) {
    await s({
      status: "error",
      error: a.message ?? "Scan failed. Please try again."
    }), r({ type: "SCAN_ERROR", error: a.message });
  }
}
async function d(e) {
  const t = await u();
  switch (e.type) {
    case "status":
      await s({
        remaining: e.remaining ?? t.remaining,
        lines: [
          ...t.lines,
          { type: "status", text: e.message, cls: "blue" }
        ]
      });
      break;
    case "stack":
      await s({ tags: e.tags });
      break;
    case "skills":
      await s({ skills: e.skills });
      break;
    case "content":
      await s({ markFile: t.markFile + e.text });
      break;
    case "done":
      await s({
        status: "done",
        zipBase64: e.zipBase64,
        markFile: e.markFile,
        tags: e.tags,
        skills: e.skills,
        remaining: e.remaining ?? t.remaining,
        lines: [
          ...t.lines,
          { type: "done", text: "→ Complete ✓", cls: "green" }
        ]
      });
      break;
    case "error":
      await s({ status: "error", error: e.message });
      break;
  }
  r({ type: "STATE_UPDATE", data: e });
}
async function h(e, t) {
  try {
    const a = await u(), i = await fetch(T, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markFile: e, repoName: t, stack: a.tags })
    }), { ideas: n } = await i.json();
    await s({ ideas: n }), r({ type: "IDEAS_READY", ideas: n });
  } catch {
  }
}
async function u() {
  return (await chrome.storage.local.get("scanState")).scanState ?? l;
}
async function s(e) {
  const t = await u();
  await chrome.storage.local.set({ scanState: { ...t, ...e } });
}
function r(e) {
  chrome.runtime.sendMessage(e).catch(() => {
  });
}
