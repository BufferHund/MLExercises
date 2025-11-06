import type { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: 'web' | 'ai';
  description: string;
}

export type ToolId =
  | 'json-formatter'
  | 'base64'
  | 'url-encoder'
  | 'timestamp'
  | 'color-converter'
  | 'regex-tester'
  | 'token-counter'
  | 'prompt-template'
  | 'markdown-preview'
  | 'csv-to-json'
  | 'uuid-generator'
  | 'hash-calculator';
