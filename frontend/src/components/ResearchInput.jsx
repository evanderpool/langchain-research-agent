const DEPTH_OPTIONS = [
  { value: 2, label: 'Fast', desc: '~15s' },
  { value: 3, label: 'Balanced', desc: '~25s' },
  { value: 5, label: 'Thorough', desc: '~45s' },
]

export default function ResearchInput({ question, setQuestion, depth, setDepth, onSubmit, status }) {
  const isRunning = status === 'running'

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isRunning && question.trim()) {
      onSubmit()
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex gap-3">
        <textarea
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-slate-200
                     placeholder-slate-500 resize-none focus:outline-none focus:border-accent
                     transition-colors duration-150 text-sm leading-relaxed"
          rows={2}
          placeholder="Ask a research question… (Ctrl+Enter to submit)"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
        />
        <button
          className="btn-primary self-end shrink-0 flex items-center gap-2"
          onClick={onSubmit}
          disabled={isRunning || !question.trim()}
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin-slow" />
              Researching
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Research
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 shrink-0">Research depth:</span>
        <div className="flex gap-2">
          {DEPTH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDepth(opt.value)}
              disabled={isRunning}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors duration-150
                ${depth === opt.value
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {opt.label}
              <span className="ml-1 opacity-60">{opt.desc}</span>
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-600 ml-auto">{depth} parallel researchers</span>
      </div>
    </div>
  )
}
