import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show at most 5 page buttons centered around currentPage
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  // Insert ellipsis markers
  const withEllipsis: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visiblePages) {
    if (prev !== null && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const linkClass = (active: boolean) =>
    `inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all
     ${active
       ? "bg-mosque text-white shadow-sm"
       : "bg-white border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque"
     }`;

  const arrowClass = (enabled: boolean) =>
    `inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm transition-all
     ${enabled
       ? "bg-white border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque cursor-pointer"
       : "bg-white/50 border border-nordic-dark/5 text-nordic-dark/30 cursor-not-allowed pointer-events-none"
     }`;

  return (
    <nav
      aria-label="Property pages"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link href={`/?page=${currentPage - 1}`} className={arrowClass(true)} aria-label="Previous page">
          <span className="material-icons text-lg">chevron_left</span>
        </Link>
      ) : (
        <span className={arrowClass(false)} aria-disabled="true" aria-label="Previous page">
          <span className="material-icons text-lg">chevron_left</span>
        </span>
      )}

      {/* Page numbers */}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center w-10 h-10 text-nordic-muted text-sm select-none"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={`/?page=${p}`}
            className={linkClass(p === currentPage)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link href={`/?page=${currentPage + 1}`} className={arrowClass(true)} aria-label="Next page">
          <span className="material-icons text-lg">chevron_right</span>
        </Link>
      ) : (
        <span className={arrowClass(false)} aria-disabled="true" aria-label="Next page">
          <span className="material-icons text-lg">chevron_right</span>
        </span>
      )}
    </nav>
  );
}
