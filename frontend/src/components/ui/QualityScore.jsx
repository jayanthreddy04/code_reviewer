import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export default function QualityScore({ score = 0, size = 160 }) {
  const safeScore = Math.min(100, Math.max(0, score));
  const color =
    safeScore >= 80 ? '#22c55e' : safeScore >= 60 ? '#f59e0b' : '#ef4444';

  const data = [
    { value: safeScore, fill: color },
    { value: 100 - safeScore, fill: '#e5e7eb' },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {safeScore}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        Quality Score
      </p>
    </div>
  );
}
