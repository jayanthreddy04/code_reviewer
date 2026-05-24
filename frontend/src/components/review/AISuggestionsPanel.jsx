import { useState } from 'react';
import {
  Bug,
  Shield,
  Zap,
  BookOpen,
  Wrench,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import SeverityBadge from '../ui/SeverityBadge';
import toast from 'react-hot-toast';

const sections = [
  { key: 'bugs', label: 'Bugs', icon: Bug, color: 'text-red-500' },
  { key: 'securityIssues', label: 'Security', icon: Shield, color: 'text-orange-500' },
  { key: 'performanceTips', label: 'Performance', icon: Zap, color: 'text-yellow-500' },
  { key: 'bestPractices', label: 'Best Practices', icon: BookOpen, color: 'text-green-500' },
  { key: 'refactoringIdeas', label: 'Refactoring', icon: Wrench, color: 'text-blue-500' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CollapsibleSection({ title, icon: Icon, color, items }) {
  const [open, setOpen] = useState(true);

  if (!items?.length) return null;

  return (
    <div className="card !p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={clsx('h-5 w-5', color)} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title} ({items.length})
          </h3>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900/50"
            >
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
              <CopyButton text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AISuggestionsPanel({ review }) {
  if (!review) return null;

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          Inline Comments ({review.inlineComments?.length || 0})
        </h3>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {review.inlineComments?.length ? (
            review.inlineComments.map((comment, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-lg p-3',
                  `severity-${comment.severity}`
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-gray-500">
                    Line {comment.line}
                  </span>
                  <SeverityBadge severity={comment.severity} />
                </div>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                  {comment.message}
                </p>
                {comment.suggestion && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    💡 {comment.suggestion}
                  </p>
                )}
                <div className="mt-2 flex justify-end">
                  <CopyButton
                    text={`Line ${comment.line}: ${comment.message}${comment.suggestion ? ` — ${comment.suggestion}` : ''}`}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No inline comments</p>
          )}
        </div>
      </div>

      {sections.map(({ key, label, icon, color }) => (
        <CollapsibleSection
          key={key}
          title={label}
          icon={icon}
          color={color}
          items={review[key]}
        />
      ))}

      {review.complexityAnalysis && (
        <div className="card !p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Complexity Analysis</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {review.complexityAnalysis}
          </p>
        </div>
      )}
    </div>
  );
}
