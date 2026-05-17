import { useEffect, useState } from 'react'

const DEPTH_LABELS = { 2: 'Fast', 3: 'Balanced', 5: 'Thorough' }

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffH = diffMs / 3_600_000
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  if (diffH < 48) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function HistorySidebar({ onSelect, onNew, activeId }) {
  const [history, setHistory] = useState([])
  const [hoveredId, setHoveredId] = useState(null)

  async function loadHistory() {
    try {
      const res = await fetch('/api/history')
      if (res.ok) setHistory(await res.json())
    } catch {}
  }

  useEffect(() => { loadHistory() }, [])

  // Expose reload so parent can call it after a new report saves
  HistorySidebar.reload = loadHistory

  async function handleDelete(e, id) {
    e.stopPropagation()
    await fetch(`/api/history/${id}`, { method: 'DELETE' })
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-2 h-full">
      <div className="card p-3">
        <button onClick={onNew} className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Research
        </button>
      </div>

      <div className="card flex-1 overflow-y-auto p-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-2 py-1.5">
          History
        </p>
        {history.length === 0 ? (
          <p className="text-xs text-slate-600 px-2 py-3">No research history yet.</p>
        ) : (
          <div className="space-y-0.5">
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-100
                  ${activeId === item.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-300 leading-snug truncate font-medium">{item.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600">{formatDate(item.created_at)}</span>
                    <span className={`badge ${
                      item.depth === 5 ? 'bg-purple-900/40 text-purple-400' :
                      item.depth === 2 ? 'bg-blue-900/40 text-blue-400' :
                      'bg-teal-900/40 text-teal-400'
                    }`}>
                      {DEPTH_LABELS[item.depth] ?? item.depth}
                    </span>
                  </div>
                </div>
                {hoveredId === item.id && (
                  <button
                    onClick={e => handleDelete(e, item.id)}
                    className="shrink-0 text-slate-600 hover:text-red-400 transition-colors mt-0.5"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
