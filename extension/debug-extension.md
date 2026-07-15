# MARK Extension Debug Guide

## Check content script is running

1. Open GitHub repo page (e.g., `github.com/facebook/react`)
2. Open DevTools Console (F12)
3. Run:
```js
chrome.storage.local.get('currentRepo', (result) => {
  console.log('currentRepo:', result.currentRepo)
})
```

Expected: `{ owner: "facebook", repo: "react" }`

## Check service worker is running

1. Go to `chrome://extensions/`
2. Find "MARK Intelligence"
3. Click "Inspect views service worker"
4. In console, run:
```js
chrome.storage.local.get('scanState', (result) => {
  console.log('scanState:', result.scanState)
})
```

Expected: Should show scanState with `status: 'idle'`

## Check popup

1. Right-click MARK icon → Inspect
2. Console should show any errors
3. Check if:
   - `chrome.storage.local.get` is being called
   - `chrome.runtime.sendMessage` works
   - Button click triggers handler

## Manual test flow

In popup DevTools console:
```js
// Check if repo is detected
chrome.storage.local.get('currentRepo', (r) => console.log(r))

// Manually trigger scan
chrome.runtime.sendMessage({
  type: 'START_SCAN',
  owner: 'facebook',
  repo: 'react'
}, (response) => {
  console.log('Response:', response)
})

// Check scanState updates
chrome.storage.local.get('scanState', (r) => console.log(r))
```

## Common issues

1. **Content script not detecting repo**: Check URL pattern, excluded paths
2. **Service worker not responding**: Check if background.js loaded without errors
3. **Popup shows "idle"**: Check if `chrome.storage.local.get` returns data
4. **Button does nothing**: Check console for errors, verify onClick handler

## Verify build output

```bash
# Check content script has GitHub detection code
grep -o "extractRepo\|currentRepo" extension/dist/content/all.iife_dev.js

# Check service worker has message handlers
grep -o "START_SCAN\|onMessage" extension/dist/background.js

# Check popup has handlers
grep -o "handleScan\|sendMessage" extension/dist/popup/assets/index-*.js
```
