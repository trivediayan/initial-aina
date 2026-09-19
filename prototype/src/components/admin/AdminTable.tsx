import './AdminTable.css'

interface Column<T> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  loading?: boolean
}

export function AdminTable<T>({ columns, data, onRowClick, emptyMessage = 'No data available', loading = false }: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="table-loading">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="admin-table-container">
        <div className="table-empty">
          <div className="empty-icon">📭</div>
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.sortable ? 'sortable' : ''}>
                {column.label}
                {column.sortable && <span className="sort-icon">↕</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
