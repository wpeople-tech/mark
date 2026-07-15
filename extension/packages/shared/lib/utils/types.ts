import type { COLORS } from './const.js';
import type { TupleToUnion } from 'type-fest';

export type * from 'type-fest';
export type ColorType = 'success' | 'info' | 'error' | 'warning' | keyof typeof COLORS;
export type ExcludeValuesFromBaseArrayType<B extends string[], E extends (string | number)[]> = Exclude<
  TupleToUnion<B>,
  TupleToUnion<E>
>[];
export type ManifestType = chrome.runtime.ManifestV3;

// --- MARK Intelligence Types ---

export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface TerminalLine {
  type: 'status' | 'stack' | 'skills' | 'content' | 'done' | 'error';
  text: string;
  cls?: 'dim' | 'white' | 'blue' | 'green' | 'yellow';
}

export interface BuildIdea {
  websiteName: string;
  domain: string;
  ticker: string;
  valueProp: string;
  pumpFunAngle: string;
  buildEffort: string;
  coreCapabilityUsed: string;
}

export interface ScanState {
  status: 'idle' | 'scanning' | 'done' | 'error' | 'rate_limited';
  lines: TerminalLine[];
  tags: string[];
  skills: string[];
  markFile: string;
  zipBase64: string;
  repoName: string;
  ideas: BuildIdea[];
  remaining: number;
  error?: string;
}
