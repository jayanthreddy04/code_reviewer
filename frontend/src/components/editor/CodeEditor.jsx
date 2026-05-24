import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGES } from '../../utils/constants';

export default function CodeEditor({ value, onChange, language = 'javascript', height = '400px' }) {
  const { darkMode } = useTheme();
  const monacoLang = LANGUAGES.find((l) => l.value === language)?.monaco || language;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <Editor
        height={height}
        language={monacoLang}
        value={value}
        onChange={onChange}
        theme={darkMode ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
