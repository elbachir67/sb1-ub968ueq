import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressDataPoint {
  date: string;
  progress: number;
  quizScore?: number;
  timeSpent?: number;
}

interface LearningProgressChartProps {
  data: ProgressDataPoint[];
  showQuizScores?: boolean;
  showTimeSpent?: boolean;
  height?: number;
}

const LearningProgressChart: React.FC<LearningProgressChartProps> = ({
  data,
  showQuizScores = true,
  showTimeSpent = false,
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">Aucune donnée de progression disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
              color: "#E5E7EB",
            }}
            labelStyle={{ color: "#E5E7EB" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="progress"
            name="Progression (%)"
            stroke="#8B5CF6"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          {showQuizScores && (
            <Line
              type="monotone"
              dataKey="quizScore"
              name="Score Quiz (%)"
              stroke="#10B981"
              strokeWidth={2}
            />
          )}
          {showTimeSpent && (
            <Line
              type="monotone"
              dataKey="timeSpent"
              name="Temps (min)"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LearningProgressChart;
