export default function ExportButtons({ reportId }) {
  function download(format) {
    const a = document.createElement('a')
    a.href = `/api/export/${reportId}?format=${format}`
    a.click()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => download('markdown')}
        className="btn-ghost flex items-center gap-1.5 text-xs"
        title="Download as Markdown"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        .md
      </button>
      <button
        onClick={() => download('pdf')}
        className="btn-ghost flex items-center gap-1.5 text-xs"
        title="Download as PDF"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        PDF
      </button>
    </div>
  )
}
