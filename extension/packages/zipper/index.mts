import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { zipBundle } from './lib/index.js';
import { IS_FIREFOX } from '@extension/env';

const YYYY_MM_DD = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const HH_mm_ss = new Date().toISOString().slice(11, 19).replace(/:/g, '');
const fileName = `extension-${YYYY_MM_DD}-${HH_mm_ss}`;

// Create ZIP in dist-zip/ for local reference
await zipBundle({
  distDirectory: resolve(import.meta.dirname, '..', '..', '..', 'dist'),
  buildDirectory: resolve(import.meta.dirname, '..', '..', '..', 'dist-zip'),
  archiveName: IS_FIREFOX ? `${fileName}.xpi` : `${fileName}.zip`,
});

// Also create a stable version in landing page public/
await zipBundle({
  distDirectory: resolve(import.meta.dirname, '..', '..', '..', 'dist'),
  buildDirectory: resolve(import.meta.dirname, '..', '..', '..', '..', 'public'),
  archiveName: 'mark-extension.zip',
});

// Copy unpacked extension to public/extension/
const publicExtensionDir = resolve(import.meta.dirname, '..', '..', '..', '..', 'public', 'extension');
if (!existsSync(publicExtensionDir)) {
  mkdirSync(publicExtensionDir, { recursive: true });
}
const distDir = resolve(import.meta.dirname, '..', '..', '..', 'dist');
cpSync(distDir, publicExtensionDir, { recursive: true });

console.log('✓ Extension packaged to:');
console.log('  - extension/dist-zip/' + (IS_FIREFOX ? `${fileName}.xpi` : `${fileName}.zip`));
console.log('  - public/mark-extension.zip');
console.log('  - public/extension/ (unpacked)');
