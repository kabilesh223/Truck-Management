export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl px-5 py-4 mb-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black">{title}</h1>
          {subtitle && <p className="text-blue-200 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
        </div>
        {children && (
          <div className="flex flex-wrap gap-2">{children}</div>
        )}
      </div>
    </div>
  )
}
