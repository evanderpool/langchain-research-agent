function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function SourceItem({ source, index }) {
  const domain = getDomain(source.url)
  const initial = domain[0]?.toUpperCase() ?? '?'

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors duration-150 group"
    >
      <span className="w-6 h-6 rounded bg-accent/10 border border-accent/20 text-accent text-xs font-bold
                       flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-accent group-hover:text-accent-dim truncate">{domain}</p>
        <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-2">{source.content?.slice(0, 100)}</p>
      </div>
    </a>
  )
}

export default function SourcePanel({ sources }) {
  if (!sources || sources.length === 0) return null

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-2">
      <div className="card p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sources
          </h3>
          <span className="badge bg-slate-800 text-slate-400">{sources.length}</span>
        </div>
        <div className="space-y-0.5">
          {sources.map((source, i) => (
            <SourceItem key={i} source={source} index={i} />
          ))}
        </div>
      </div>
    </aside>
  )
}
