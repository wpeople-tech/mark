#!/usr/bin/env node
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const publicExtDir = resolve(__dirname, '../../public/extension');

if (existsSync(distDir)) {
  if (existsSync(publicExtDir)) {
    rmSync(publicExtDir, { recursive: true, force: true });
  }
  
  cpSync(distDir, publicExtDir, { recursive: true, force: true });
  console.log('✓ Synced extension/dist/ → public/extension/');
} else {
  console.warn('⚠ extension/dist/ not found, skipping sync');
  process.exit(1);
}
