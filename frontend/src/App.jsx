import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Editor from './pages/Editor';
import FileUpload from './pages/FileUpload';
import GitHubAnalyzer from './pages/GitHubAnalyzer';
import History from './pages/History';
import ReviewDetail from './pages/ReviewDetail';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:!bg-gray-800 dark:!text-white',
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="editor" element={<Editor />} />
              <Route path="upload" element={<FileUpload />} />
              <Route path="github" element={<GitHubAnalyzer />} />
              <Route path="history" element={<History />} />
              <Route path="review/:id" element={<ReviewDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
