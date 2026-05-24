import ReactMarkdown from 'react-markdown';
import { Download, FileText } from 'lucide-react';
import QualityScore from '../ui/QualityScore';
import AISuggestionsPanel from './AISuggestionsPanel';
import Button from '../ui/Button';
import { reviewApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ReviewResults({ review }) {
  if (!review) return null;

  const handleExport = async (format) => {
    try {
      const blob = await reviewApi.exportReview(review._id, format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${review._id}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {review.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {review.language} · {review.sourceType} ·{' '}
              {new Date(review.createdAt).toLocaleString()}
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{review.summary}</p>
          </div>
          <QualityScore score={review.qualityScore} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => handleExport('txt')}>
            <FileText className="h-4 w-4" />
            Export TXT
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            AI Review Report
          </h3>
          <div className="prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[600px]">
            <ReactMarkdown>
              {review.markdownReport || review.summary || 'No report available'}
            </ReactMarkdown>
          </div>
        </div>
        <AISuggestionsPanel review={review} />
      </div>
    </div>
  );
}
