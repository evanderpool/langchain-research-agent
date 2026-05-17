function StepIcon({ status }) {
  if (status === 'done') {
    return (
      <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin-slow shrink-0" />
    )
  }
  return (
    <span className="w-6 h-6 rounded-full border border-border bg-surface shrink-0" />
  )
}

function Step({ label, status, detail }) {
  return (
    <div className={`flex items-start gap-3 py-2 transition-opacity duration-300 ${status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
      <StepIcon status={status} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-300 leading-tight">{label}</p>
        {detail && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{detail}</p>
        )}
      </div>
    </div>
  )
}

export default function AgentPipeline({ steps, status }) {
  if (status === 'idle') return null

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Agent Pipeline
      </h3>
      <div className="divide-y divide-border/50">
        {steps.map((step, i) => (
          <Step
            key={i}
            label={step.label}
            status={step.status}
            detail={step.detail}
          />
        ))}
      </div>
    </div>
  )
}
