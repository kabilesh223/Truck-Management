export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="bg-[#1F4E79] text-white rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  )
}
