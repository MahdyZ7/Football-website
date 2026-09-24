import { TableRowSkeleton, Skeleton } from 'football-ds';

// Rows render as <tr>s: compose inside the app's standard table card.
export const InTable = () => (
  <div className="rounded-lg shadow-md overflow-hidden w-[640px]" style={{ backgroundColor: 'var(--bg-card)' }}>
    <table className="w-full">
      <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <tr>
          {[0, 1, 2, 3].map((i) => (
            <th key={i} className="px-4 py-3"><Skeleton width="60%" height={16} /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        <TableRowSkeleton columns={4} rows={5} />
      </tbody>
    </table>
  </div>
);
