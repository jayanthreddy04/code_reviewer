import * as acorn from 'acorn';
import { parse as babelParse } from '@babel/parser';

const JS_LANGUAGES = ['javascript', 'typescript', 'jsx', 'tsx'];

export const analyzeCodeStatically = (code, language = 'javascript') => {
  const issues = [];
  const metrics = {
    lines: code.split('\n').length,
    characters: code.length,
    functions: 0,
    complexity: 1,
  };

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (/\beval\s*\(/.test(line)) {
      issues.push({
        line: lineNum,
        message: 'Avoid eval() - security risk',
        severity: 'high',
        category: 'security',
      });
    }
    if (/console\.(log|debug|info)\(/.test(line)) {
      issues.push({
        line: lineNum,
        message: 'Remove console statement in production code',
        severity: 'low',
        category: 'best-practice',
      });
    }
    if (/password\s*=\s*['"][^'"]+['"]/i.test(line)) {
      issues.push({
        line: lineNum,
        message: 'Hardcoded password detected',
        severity: 'high',
        category: 'security',
      });
    }
    if (/var\s+\w+/.test(line)) {
      issues.push({
        line: lineNum,
        message: 'Prefer const/let over var',
        severity: 'low',
        category: 'style',
      });
    }
    if (line.length > 120) {
      issues.push({
        line: lineNum,
        message: 'Line exceeds 120 characters',
        severity: 'low',
        category: 'style',
      });
    }
  });

  const duplicateBlocks = findDuplicateBlocks(lines);
  duplicateBlocks.forEach((block) => {
    issues.push({
      line: block.startLine,
      message: `Possible duplicate code block (${block.lines} lines)`,
      severity: 'medium',
      category: 'duplication',
    });
  });

  if (JS_LANGUAGES.includes(language)) {
    const fnMatches = code.match(
      /function\s+\w+|=>\s*{|\bfunction\s*\(|\b(async\s+)?function\b/g
    );
    metrics.functions = fnMatches ? fnMatches.length : 0;
    const complexityMatches = code.match(
      /\b(if|else|for|while|switch|case|catch|\?)\b/g
    );
    metrics.complexity += complexityMatches ? complexityMatches.length : 0;

    try {
      babelParse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy'],
        errorRecovery: true,
      });
    } catch {
      try {
        acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
      } catch (parseErr) {
        issues.push({
          line: parseErr.loc?.line || 1,
          message: `Syntax error: ${parseErr.message}`,
          severity: 'high',
          category: 'syntax',
        });
      }
    }
  }

  return { issues, metrics, duplicateBlocks };
};

function findDuplicateBlocks(lines, minLines = 4) {
  const duplicates = [];
  const blockMap = new Map();

  for (let i = 0; i <= lines.length - minLines; i++) {
    const block = lines
      .slice(i, i + minLines)
      .map((l) => l.trim())
      .join('\n');
    if (!block.trim()) continue;

    if (blockMap.has(block)) {
      const existing = blockMap.get(block);
      if (!duplicates.find((d) => d.hash === block)) {
        duplicates.push({
          hash: block,
          startLine: existing + 1,
          lines: minLines,
        });
      }
    } else {
      blockMap.set(block, i);
    }
  }

  return duplicates;
}
