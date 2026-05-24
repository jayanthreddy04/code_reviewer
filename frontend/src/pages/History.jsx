import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { reviewApi } from '../lib/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SeverityBadge from '../components/ui/SeverityBadge';
import Button from '../components/ui/Button';

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticMode, setSemanticMode] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchHistory = async (search = '') => {
    setLoading(true);
    try {
      const res = await reviewApi.getHistory({ page: 1, limit: 20, search });
      setReviews(res.data.reviews);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchHistory();
      return;
    }

    if (semanticMode) {
      setLoading(true);
      try {
        const res = await reviewApi.search({ query: searchQuery, limit: 20 });
        setReviews(res.data.reviews);
        if (res.data.semanticSearch) {
          toast.success('Semantic search completed');
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      fetchHistory(searchQuery);
    }
  };

  const highIssues = (review) =>
    review.inlineComments?.filter((c) => c.severity === 'high').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review History Dashboard
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Browse and search your past code reviews
        </p>
      </div>

      <form onSubmit={handleSearch} className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="input-field pl-10"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={semanticMode}
              onChange={(e) => setSemanticMode(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <Sparkles className="h-4 w-4 text-primary-500" />
            Semantic Search (Pinecone)
          </label>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner text="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="card py-16 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No reviews found. Start by reviewing some code!</p>
          <Link to="/editor" className="btn-primary mt-4 inline-flex">
            Go to Editor
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Link
              key={review._id}
              to={`/review/${review._id}`}
              className="card flex items-center justify-between gap-4 transition hover:border-primary-300 hover:shadow-md dark:hover:border-primary-600"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                  {review.title}
                </h3>
                <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                  {review.summary}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    {review.language}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                    {review.sourceType}
                  </span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  {highIssues(review) > 0 && (
                    <SeverityBadge severity="high" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={clsx(
                    'flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold',
                    review.qualityScore >= 80
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                      : review.qualityScore >= 60
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                  )}
                >
                  {review.qualityScore}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
          {pagination.total > 0 && (
            <p className="text-center text-sm text-gray-500">
              Showing {reviews.length} of {pagination.total} reviews
            </p>
          )}
        </div>
      )}
    </div>
  );
}
