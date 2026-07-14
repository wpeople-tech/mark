export function Footer() {
  return (
    <footer className="px-10 py-6 border-t border-border flex items-center justify-between flex-wrap gap-4">
      <div className="text-[12px] text-muted font-mono">
        markintel.xyz · free · $MARK
      </div>
      <div className="flex gap-6 text-[12px] text-muted">
        <a href="#" className="text-muted no-underline transition-colors duration-150 hover:text-ink">
          X / Twitter
        </a>
        <a href="#" className="text-muted no-underline transition-colors duration-150 hover:text-ink">
          GitHub
        </a>
        <a href="#" className="text-muted no-underline transition-colors duration-150 hover:text-ink">
          Chrome Store
        </a>
        <a href="#" className="text-muted no-underline transition-colors duration-150 hover:text-ink">
          pump.fun
        </a>
      </div>
    </footer>
  )
}
