interface TimelineItem {
  title: string;

  completed: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({
  items,
}: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4"
        >
          <div
            className={`h-4 w-4 rounded-full ${
              item.completed
                ? 'bg-green-600'
                : 'bg-slate-300'
            }`}
          />

          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
}