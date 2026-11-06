import React, { useEffect, useState } from 'react'

const getInitialTheme = () => {
  try {
    return window.localStorage.getItem('wavely-theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const FooterPublic = () => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      window.localStorage.setItem('wavely-theme', theme)
    } catch {
      return
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <footer className="layout__footer">
      <div className="footer-identity">
        <p>Alejandro Amorós Talavera &copy;</p>
        <button
          className="footer-linkedin"
          type="button"
          aria-label="Abrir perfil en LinkedIn"
          title="Abrir perfil en LinkedIn"
          onClick={() => window.open('https://www.linkedin.com/in/alejandro-amor%C3%B3s-talavera-a56277113/', '_blank', 'noopener,noreferrer')}
        >
          <span aria-hidden="true">in</span>
        </button>
      </div>
      <div className="footer-date">
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
          title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
          onClick={toggleTheme}
        >
          <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}
