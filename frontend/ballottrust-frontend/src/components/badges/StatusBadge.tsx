import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles = {
    DRAFT: 'bg-gray-100 text-gray-700',

    PENDING_APPROVAL:
      'bg-yellow-100 text-yellow-700',

    APPROVED:
      'bg-blue-100 text-blue-700',

    PUBLISHED:
      'bg-indigo-100 text-indigo-700',

    ACTIVE:
      'bg-green-100 text-green-700',

    VOTING_CLOSED:
      'bg-red-100 text-red-700',

    RESULT_PUBLISHED:
      'bg-purple-100 text-purple-700',

    ARCHIVED:
      'bg-slate-200 text-slate-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',

        styles[
          status as keyof typeof styles
        ] ??
          'bg-gray-100 text-gray-700',
      )}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}