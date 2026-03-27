interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-12">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-14 h-14 rounded-2xl text-sm font-black transition-all ${
            p === page 
            ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-y-[-2px]' 
            : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
