#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import * as acorn from 'acorn';

const program = new Command();
program.name('detect-creds').description('Scan for default/hardcoded credentials in codebase').version('1.0.0');

const patterns = [
  /password\\s*[:=]\\s*['"`]([^'"`]{3,})['"`]/gi,
  /api[_-]?key\\s*[:=]\\s*['"`]([^'"`]{10,})['"`]/gi,
  /secret\\s*[:=]\\s*['"`]([^'"`]{5,})['"`]/gi,
  /token\\s*[:=]\\s*['"`]([^'"`]{10,})['"`]/gi,
  /key\\s*[:=]\\s*['"`]([^'"`]{10,})['"`]/gi,
];

const weakPasswords = ['admin123', 'manager123', 'viewer123', 'password', '123456', 'admin'];

interface Finding {
  file: string;
  line: number;
  column: number;
  type: string;
  value: string;
  risk: 'high' | 'medium' | 'low';
}

function getFiles(dir: string, extensions: string[] = ['.ts', '.js', '.tsx', '.jsx', '.json']): string[] {
  const files: string[] = [];
  let items;
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name === 'dist') continue;
      files.push(...getFiles(fullPath, extensions));
    } else {
      const ext = path.extname(item.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function scanFile(filePath: string): Finding[] {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const findings: Finding[] = [];

  // Regex scan
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const value = match[1];
      const risk = value.length > 20 || /sk-|pk-|ak-/.test(value) ? 'high' : 'medium';
      const line = content.slice(0, match.index!).split('\\n').length;
      findings.push({ file: filePath, line, column: match.index!, type: 'regex', value, risk });
    }
  }

  // Weak passwords
  for (const weak of weakPasswords) {
    const index = content.indexOf(weak);
    if (index > -1) {
      const line = content.slice(0, index).split('\\n').length;
      findings.push({ file: filePath, line, column: index, type: 'weak', value: weak, risk: 'medium' });
    }
  }

  // AST literal scan
  try {
    const ast = acorn.parse(content, { 
      sourceType: 'module', 
      ecmaVersion: 'latest',
      allowImportExportEverywhere: true 
    });
    walkAST(ast, (node: any) => {
      if (node.type === 'Literal' && typeof node.value === 'string' && node.value.length > 10) {
        const raw = node.raw.slice(1, -1); // remove quotes
        if (!/process\.env/.test(node.raw) && (raw.length > 20 || /sk-|pk-/.test(raw))) {
          findings.push({ 
            file: filePath, 
            line: node.loc!.start.line, 
            column: node.loc!.start.column, 
            type: 'literal', 
            value: raw, 
            risk: 'high' 
          });
        }
      }
    });
  } catch (e) {
    // Ignore parse errors
  }

  return findings;
}

function walkAST(node: any, visitor: (node: any) => void) {
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((item: any) => {
        if (item && typeof item === 'object') walkAST(item, visitor);
      });
    } else if (child && typeof child === 'object') {
      walkAST(child, visitor);
    }
  }
}

program.action(() => {
  const files = getFiles(process.cwd());
  const allFindings: Finding[] = [];

  for (const file of files) {
    const findings = scanFile(file);
    allFindings.push(...findings);
  }

  console.log(chalk.bold(`\n🔍 Credential Scan Complete - ${allFindings.length} findings\n`));

  if (allFindings.length === 0) {
    console.log(chalk.green('✅ No default credentials or secrets detected!'));
    return;
  }

  const byRisk: Record<string, Finding[]> = {
    high: [],
    medium: [],
    low: [],
  };

  allFindings.forEach(f => byRisk[f.risk].push(f));

  for (const [risk, findings] of Object.entries(byRisk)) {
    if (findings.length === 0) continue;
    const bgColor = risk === 'high' ? 'bgRed' : risk === 'medium' ? 'bgYellow' : 'bgGray';
console.log((chalk[bgColor] as any)(`  ${risk.toUpperCase()} (${findings.length}) `));
    findings.forEach(f => {
      console.log(chalk.gray(`    ${path.relative(process.cwd(), f.file)}:${f.line}:${f.column}`), chalk[risk === 'high' ? 'red' : 'yellow'](f.value.slice(0, 50) + '...'));
    });
    console.log('');
  }
});

program.parse(process.argv);

