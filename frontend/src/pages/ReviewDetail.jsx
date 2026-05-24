import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewApi } from '../lib/api';
import ReviewResults from '../components/review/ReviewResults';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ReviewDetail() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await reviewApi.getReview(id);
        setReview(res.data.review);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading review..." />;
  if (!review) return <p className="text-center text-gray-500">Review not found</p>;

  return (
    <div className="space-y-6">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>
      <ReviewResults review={review} />
    </div>
  );
}
