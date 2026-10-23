import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { name: string; votes: number }[];
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

export default function ResultsPieChart({
  data,
}: Props) {
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="votes"
          nameKey="name"
          outerRadius={120}
          label
        >
          {data.map(
            (_, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[
                    index %
                    COLORS.length
                  ]
                }
              />
            )
          )}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}