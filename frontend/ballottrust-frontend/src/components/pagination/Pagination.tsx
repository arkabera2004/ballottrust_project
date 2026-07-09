import Button from '../buttons/Button';

interface PaginationProps {
  page: number;

  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() =>
          onPageChange(page - 1)
        }
      >
        Previous
      </Button>

      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={
          page >= totalPages
        }
        onClick={() =>
          onPageChange(page + 1)
        }
      >
        Next
      </Button>
    </div>
  );
}