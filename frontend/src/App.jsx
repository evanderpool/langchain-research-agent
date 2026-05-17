import { useCallback, useState } from 'react'
import AgentPipeline from './components/AgentPipeline'
import ExportButtons from './components/ExportButtons'
import HistorySidebar from './components/HistorySidebar'
import ResearchInput from './components/ResearchInput'
import ReportViewer from './components/ReportViewer'
import SourcePanel from './components/SourcePanel'
import { useSSE } from './hooks/useSSE'

function buildInitialSteps(depth) {
  return [
    { label: 'Planner', status: 'running', detail: 'Breaking down your question…' },
    ...Array.from({ length: depth }, (_, i) => ({
      label: `Researcher ${i + 1}`,
      status: 'pending',
      detail: null,
    })),
    { label: 'Synthesizer', status: 'pending', detail: null },
  ]
}

export default function App() {
  const [question, setQuestion] = useState('')
  const [depth, setDepth] = useState(3)
  const [status, setStatus] = useState('idle')      // idle | running | done | error
  const [agentSteps, setAgentSteps] = useState([])
  const [report, setReport] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const { startResearch } = useSSE()

  const callbacks = useCallback(() => ({
    planner_done: ({ sub_questions }) => {
      setAgentSteps(prev => {
        const next = [...prev]
        // Mark planner done
        const plannerIdx = next.findIndex(s => s.label === 'Planner')
        if (plannerIdx !== -1) {
          next[plannerIdx] = { ...next[plannerIdx], status: 'done', detail: `${sub_questions.length} sub-questions` }
        }
        // Replace pending researcher steps with named ones
        const researcherStart = next.findIndex(s => s.label.startsWith('Researcher'))
        const synthIdx = next.findIndex(s => s.label === 'Synthesizer')
        const namedResearchers = sub_questions.map((q, i) => ({
          label: `Researcher ${i + 1}`,
          status: 'running',
          detail: q.length > 60 ? q.slice(0, 60) + '…' : q,
          subQuestion: q,
        }))
        return [
          ...next.slice(0, researcherStart),
          ...namedResearchers,
          next[synthIdx],
        ]
      })
    },

    researcher_done: ({ sub_question }) => {
      setAgentSteps(prev =>
        prev.map(s =>
          s.subQuestion === sub_question
            ? { ...s, status: 'done' }
            : s
        )
      )
    },

    synthesis_done: ({ synthesis }) => {
      setAgentSteps(prev =>
        prev.map(s => s.label === 'Synthesizer' ? { ...s, status: 'running', detail: 'Writing report…' } : s)
      )
      setReport(prev => ({ ...prev, synthesis }))
    },

    saved: ({ report_id, sources }) => {
      setAgentSteps(prev =>
        prev.map(s => s.label === 'Synthesizer' ? { ...s, status: 'done', detail: 'Complete' } : s)
      )
      setReport(prev => ({ ...prev, report_id, sources }))
      setActiveId(report_id)
      setStatus('done')
      HistorySidebar.reload?.()
    },

    error: ({ message }) => {
      setStatus('error')
      setErrorMessage(message)
      console.error('Research error:', message)
    },
  }), [])

  async function handleSubmit() {
    if (!question.trim() || status === 'running') return
    setStatus('running')
    setErrorMessage(null)
    setReport({ synthesis: null, sources: [], report_id: null, question })
    setAgentSteps(buildInitialSteps(depth))
    setActiveId(null)
    await startResearch(question.trim(), depth, callbacks())
  }

  function handleNew() {
    setQuestion('')
    setReport(null)
    setAgentSteps([])
    setStatus('idle')
    setActiveId(null)
    setErrorMessage(null)
  }

  async function handleSelectHistory(id) {
    try {
      const res = await fetch(`/api/history/${id}`)
      if (!res.ok) return
      const data = await res.json()
      setReport({
        synthesis: data.synthesis,
        sources: data.sources,
        report_id: data.id,
        question: data.question,
      })
      setQuestion(data.question)
      setDepth(data.depth)
      setActiveId(id)
      setStatus('done')
      setAgentSteps([])
    } catch {}
  }

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Artificial Management</p>
            <h1 className="text-sm font-semibold text-slate-200 leading-tight">Research Intelligence Agent</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-slate-500">Powered by LangGraph + Claude</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left sidebar — history */}
        <HistorySidebar onSelect={handleSelectHistory} onNew={handleNew} activeId={activeId} />

        {/* Main content */}
        <main className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
          <ResearchInput
            question={question}
            setQuestion={setQuestion}
            depth={depth}
            setDepth={setDepth}
            onSubmit={handleSubmit}
            status={status}
          />

          {status !== 'idle' && (
            <AgentPipeline steps={agentSteps} status={status} />
          )}

          {status === 'error' && (
            <div className="card p-4 border-red-900/50 bg-red-950/20">
              <p className="text-sm font-semibold text-red-400 mb-1">Research failed</p>
              {errorMessage ? (
                <p className="text-xs text-red-300 font-mono break-all">{errorMessage}</p>
              ) : (
                <p className="text-sm text-red-400">Check that your API keys are set and try again.</p>
              )}
            </div>
          )}

          <ReportViewer report={report} status={status} />
        </main>

        {/* Right panel — sources */}
        {report?.sources?.length > 0 && (
          <SourcePanel sources={report.sources} />
        )}
      </div>
    </div>
  )
}
