import { Link } from 'react-router-dom';
import {
  Code2,
  Upload,
  Github,
  History,
  Sparkles,
  Shield,
  Zap,
  Search,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Groq LLM analyzes your code for bugs, security issues, and best practices.',
  },
  {
    icon: Shield,
    title: 'Security Scanning',
    description: 'Detect vulnerabilities, hardcoded secrets, and unsafe patterns.',
  },
  {
    icon: Zap,
    title: 'Performance Tips',
    description: 'Get optimization suggestions and complexity analysis.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Search past reviews using natural language via Pinecone embeddings.',
  },
];

const quickLinks = [
  { to: '/editor', icon: Code2, label: 'Code Editor', desc: 'Paste & review snippets' },
  { to: '/upload', icon: Upload, label: 'File Upload', desc: 'Upload source files' },
  { to: '/github', icon: Github, label: 'GitHub Analyzer', desc: 'Scan repositories' },
  { to: '/history', icon: History, label: 'Review History', desc: 'Browse past reviews' },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          <Sparkles className="h-4 w-4" />
          Powered by Groq AI
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          Automated Code Reviewer
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Get instant AI-powered code reviews with bug detection, security analysis,
          performance tips, and line-by-line suggestions.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="card group transition hover:border-primary-300 hover:shadow-md dark:hover:border-primary-600"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/40">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
