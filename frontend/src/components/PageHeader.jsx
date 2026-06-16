export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 anim-fadeInUp">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight" style={{color:'#E8F5E9'}}>{title}</h1>
        {subtitle && <p className="text-xs font-medium mt-1" style={{color:'rgba(232,245,233,0.4)'}}>{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}
