import Button from '../buttons/Button';

interface EmptyStateProps {
  title: string;

  description: string;

  buttonText?: string;

  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  buttonText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-slate-500">
        {description}
      </p>

      {buttonText && onAction && (
        <Button
          className="mt-6"
          onClick={onAction}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}