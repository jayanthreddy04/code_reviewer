import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import CodeEditor from '../components/editor/CodeEditor';
import ReviewResults from '../components/review/ReviewResults';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { reviewApi } from '../lib/api';
import { LANGUAGES, SAMPLE_CODE } from '../utils/constants';

export default function Editor() {
  const [code, setCode] = useState(SAMPLE_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (SAMPLE_CODE[lang]) {
      setCode(SAMPLE_CODE[lang]);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }
    setLoading(true);
    setReview(null);
    try {
      const res = await reviewApi.reviewCode({
        code,
        language,
        title: title || undefined,
      });
      setReview(res.data.review);
      toast.success('Code review completed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(SAMPLE_CODE[language] || '');
    setReview(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Code Review Editor</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Paste your code and get AI-powered analysis with inline comments
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="input-field"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Code Review"
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReview} loading={loading}>
              <Play className="h-4 w-4" />
              Run Review
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <CodeEditor
          value={code}
          onChange={(val) => setCode(val || '')}
          language={language}
          height="450px"
        />
      </div>

      {loading && (
        <LoadingSpinner
          size="lg"
          text="AI is analyzing your code... This may take 15-30 seconds"
        />
      )}

      {review && <ReviewResults review={review} />}
    </div>
  );
}
