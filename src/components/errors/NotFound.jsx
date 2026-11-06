import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <main className="not-found">
      <div className="not-found__signal" aria-hidden="true">
        <span className="not-found__code">404</span>
        <i className="fa-solid fa-wave-square"></i>
      </div>

      <div className="not-found__content">
        <p className="not-found__eyebrow">
          <i className="fa-solid fa-satellite-dish" aria-hidden="true"></i>
          Señal perdida
        </p>
        <h1>Esta página no está en la conversación.</h1>
        <p className="not-found__description">
          El enlace puede estar roto o la publicación ya no existe. Volvamos a conectar.
        </p>
        <div className="not-found__actions">
          <Link className="not-found__link not-found__link--primary" to="/login">
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            Volver a WAVELY
          </Link>
        </div>
      </div>
    </main>
  )
}