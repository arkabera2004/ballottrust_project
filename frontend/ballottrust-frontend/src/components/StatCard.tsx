type StatCardProps = {
  title: string;
  value: string | number;
  color: string;
};

export default function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div
      className={`${color} rounded-2xl shadow-md p-6 text-white`}
    >
      <p className="opacity-90 text-sm">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3">
        {value}
      </h2>

      
    </div>
  );
}