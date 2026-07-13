import { PAGE_SIZE } from "./types";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border mt-4">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}{" "}
        of {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-muted/50"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-muted/50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
