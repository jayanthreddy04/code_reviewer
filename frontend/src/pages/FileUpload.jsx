import { useState, useRef } from 'react';
import { Upload, FileCode, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewResults from '../components/review/ReviewResults';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { reviewApi } from '../lib/api';
import { LANGUAGES } from '../utils/constants';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        return;
      }
      setFile(selected);
      const ext = selected.name.split('.').pop()?.toLowerCase();
      const langMap = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        py: 'python', java: 'java', cpp: 'cpp', c: 'c', go: 'go',
      };
      if (langMap[ext]) setLanguage(langMap[ext]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  const handleReview = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    setLoading(true);
    setReview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      const res = await reviewApi.reviewFile(formData);
      setReview(res.data.review);
      toast.success('File review completed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File Upload Review</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Upload source code files for AI-powered analysis
        </p>
      </div>

      <div className="card space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 transition hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-primary-500"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.go,.rb,.php,.txt"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center gap-3">
              <FileCode className="h-10 w-10 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-4 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-4 font-medium text-gray-700 dark:text-gray-300">
                Drop a file here or click to browse
              </p>
              <p className="mt-1 text-sm text-gray-500">
                JS, TS, Python, Java, C++, Go and more (max 5MB)
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label className="mb-1 block text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleReview} loading={loading} disabled={!file}>
            <Upload className="h-4 w-4" />
            Review File
          </Button>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" text="Analyzing uploaded file..." />}
      {review && <ReviewResults review={review} />}
    </div>
  );
}
