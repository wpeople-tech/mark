(function() {let __HMR_ID = "0.zy7q557pbs";
const LOCAL_RELOAD_SOCKET_PORT = 8081;
const LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;

const DO_UPDATE = 'do_update';
const DONE_UPDATE = 'done_update';

var MessageInterpreter = {
  send: (message) => JSON.stringify(message),
  receive: (serializedMessage) => JSON.parse(serializedMessage),
};

var initClient = ({ id, onUpdate }) => {
  const ws = new WebSocket(LOCAL_RELOAD_SOCKET_URL);

  ws.onopen = () => {
    ws.addEventListener('message', event => {
      const message = MessageInterpreter.receive(String(event.data));

      if (message.type === DO_UPDATE && message.id === id) {
        onUpdate();
        ws.send(MessageInterpreter.send({ type: DONE_UPDATE }));
      }
    });
  };
};

(() => {
  let pendingReload = false;

  initClient({
    // @ts-expect-error That's because of the dynamic code loading
    id: __HMR_ID,
    onUpdate: () => {
      // disable reload when tab is hidden
      if (document.hidden) {
        pendingReload = true;
        return;
      }
      reload();
    },
  });

  // reload
  const reload = () => {
    pendingReload = false;
    window.location.reload();
  };

  // reload when tab is visible
  const reloadWhenTabIsVisible = () => {
    if (!document.hidden && pendingReload) {
      reload();
    }
  };

  document.addEventListener('visibilitychange', reloadWhenTabIsVisible);
})();

})();
(function() {
  "use strict";
  function extractRepo() {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const excluded = ["explore", "topics", "trending", "marketplace", "settings", "orgs"];
    if (excluded.includes(parts[0])) return null;
    return { owner: parts[0], repo: parts[1] };
  }
  function updateStorage() {
    const repo = extractRepo();
    if (repo) {
      chrome.storage.local.set({ currentRepo: repo });
    } else {
      chrome.storage.local.remove("currentRepo");
    }
  }
  updateStorage();
  let lastPath = location.pathname;
  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      updateStorage();
    }
  });
  observer.observe(document.body, { subtree: true, childList: true });
})();
//# sourceMappingURL=all.iife.js.map
