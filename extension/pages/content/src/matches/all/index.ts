function extractRepo(): { owner: string; repo: string } | null {
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const excluded = ['explore', 'topics', 'trending', 'marketplace', 'settings', 'orgs'];
  if (excluded.includes(parts[0])) return null;
  return { owner: parts[0], repo: parts[1] };
}

function updateStorage(): void {
  const repo = extractRepo();
  if (repo) {
    chrome.storage.local.set({ currentRepo: repo });
  } else {
    chrome.storage.local.remove('currentRepo');
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
