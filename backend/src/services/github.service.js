import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const GITHUB_API = 'https://api.github.com';

const githubFetch = async (path) => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (config.github.token) {
    headers.Authorization = `Bearer ${config.github.token}`;
  }

  const response = await fetch(`${GITHUB_API}${path}`, { headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new AppError(
      err.message || `GitHub API error: ${response.status}`,
      response.status === 404 ? 404 : 502
    );
  }

  return response.json();
};

export const parseRepoUrl = (repoUrl) => {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/,
    /^([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = repoUrl.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  throw new AppError('Invalid GitHub repository URL or format (owner/repo)', 400);
};

export const getRepositoryInfo = async (owner, repo) => {
  return githubFetch(`/repos/${owner}/${repo}`);
};

export const getRepositoryTree = async (owner, repo, branch = 'main') => {
  try {
    const ref = await githubFetch(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    const tree = await githubFetch(
      `/repos/${owner}/${repo}/git/trees/${ref.object.sha}?recursive=1`
    );
    return tree.tree.filter((item) => item.type === 'blob');
  } catch {
    const ref = await githubFetch(`/repos/${owner}/${repo}/git/ref/heads/master`);
    const tree = await githubFetch(
      `/repos/${owner}/${repo}/git/trees/${ref.object.sha}?recursive=1`
    );
    return tree.tree.filter((item) => item.type === 'blob');
  }
};

const CODE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.go',
  '.rb', '.php', '.cs', '.swift', '.kt', '.rs', '.vue', '.svelte',
]);

export const fetchRepositoryCodeFiles = async (owner, repo, maxFiles = 5) => {
  const tree = await getRepositoryTree(owner, repo);
  const codeFiles = tree
    .filter((item) => {
      const ext = item.path.slice(item.path.lastIndexOf('.'));
      return CODE_EXTENSIONS.has(ext) && !item.path.includes('node_modules');
    })
    .slice(0, maxFiles);

  const files = [];

  for (const file of codeFiles) {
    const content = await githubFetch(
      `/repos/${owner}/${repo}/contents/${file.path}`
    );
    if (content.encoding === 'base64' && content.content) {
      const decoded = Buffer.from(content.content, 'base64').toString('utf-8');
      if (decoded.length < 50000) {
        files.push({
          path: file.path,
          content: decoded,
          language: detectLanguageFromPath(file.path),
        });
      }
    }
  }

  return files;
};

export const fetchSingleFile = async (owner, repo, filePath) => {
  const content = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`);
  if (content.encoding !== 'base64') {
    throw new AppError('Unable to decode file content', 400);
  }
  return {
    path: content.path,
    content: Buffer.from(content.content, 'base64').toString('utf-8'),
    language: detectLanguageFromPath(content.path),
  };
};

function detectLanguageFromPath(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  const map = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.go': 'go',
    '.rb': 'ruby',
    '.php': 'php',
    '.cs': 'csharp',
    '.rs': 'rust',
  };
  return map[ext] || 'javascript';
}
