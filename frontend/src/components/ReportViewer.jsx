import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ExportButtons from './ExportButtons'

export default function ReportViewer({ report, status }) {
  if (!report?.synthesis && status !== 'running') return null

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Research Report
        </h3>
        {report?.report_id && (
          <ExportButtons reportId={report.report_id} />
        )}
      </div>

      {report?.synthesis ? (
        <div className="report-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.synthesis}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-slate-500 py-4">
          <span className="w-4 h-4 border-2 border-slate-600 border-t-accent rounded-full animate-spin-slow" />
          <span className="text-sm">Synthesizing findings…</span>
        </div>
      )}
    </div>
  )
}
