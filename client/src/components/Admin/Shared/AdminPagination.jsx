import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPagination({
  currentPage,
  totalPages,
  label,
  canPrev = true,
  canNext = true,
  onPrev,
  onNext,
  className = '',
}) {
  const resolvedLabel =
    label ??
    (typeof totalPages === 'number'
      ? `Trang ${currentPage} / ${totalPages}`
      : `Trang ${currentPage}`);

  return (
    <div
      className={`admin-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <span className="text-sm text-text-secondary">
        {resolvedLabel}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canPrev}
          onClick={onPrev}
          className="text-text-secondary disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Trang trước"
        >
          <ChevronLeft size={20} />
        </Button>

        <div className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-sm font-semibold">
          {currentPage}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canNext}
          onClick={onNext}
          className="text-text-secondary disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Trang tiếp"
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}

