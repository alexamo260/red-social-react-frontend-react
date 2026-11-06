export const LoadingIndicator = ({ label = 'Cargando', size = 'normal', inline = false, showText = true }) => {
  const classes = [
    'loading-indicator',
    `loading-indicator--${size}`,
    inline && 'loading-indicator--inline'
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} role="status" aria-live="polite" aria-atomic="true">
      <span className="loading-indicator__spinner" aria-hidden="true"></span>
      {showText && <span className="loading-indicator__text" aria-hidden="true">Cargando...</span>}
      <span className="visually-hidden">{label}</span>
    </span>
  )
}