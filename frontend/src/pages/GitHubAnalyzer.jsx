import { useState } from 'react';
import { Github, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewResults from '../components/review/ReviewResults';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { reviewApi } from '../lib/api';

export default function GitHubAnalyzer() {
  const [repoUrl, setRepoUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [maxFiles, setMaxFiles] = useState(3);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }
    setLoading(true);
    setReviews([]);
    try {
      const res = await reviewApi.reviewGithub({
        repoUrl,
        filePath: filePath || undefined,
        maxFiles: Number(maxFiles),
      });
      setReviews(res.data.reviews || []);
      toast.success(`Reviewed ${res.data.reviews?.length || 0} file(s)!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          GitHub Repository Analyzer
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Connect a public GitHub repo for automated code review
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Repository URL
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo or owner/repo"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Specific File Path (optional)
          </label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="src/index.js"
            className="input-field"
          />
        </div>
        {!filePath && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Files to Review
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxFiles}
              onChange={(e) => setMaxFiles(e.target.value)}
              className="input-field max-w-[120px]"
            />
          </div>
        )}
        <Button onClick={handleAnalyze} loading={loading}>
          <Github className="h-4 w-4" />
          Analyze Repository
        </Button>
      </div>

      {loading && (
        <LoadingSpinner
          size="lg"
          text="Fetching and analyzing repository files..."
        />
      )}

      {reviews.map((review) => (
        <ReviewResults key={review._id} review={review} />
      ))}
    </div>
  );
}
