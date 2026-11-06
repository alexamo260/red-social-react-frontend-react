import { Routing } from './router/Routing'
import { SessionProvider } from './context/SessionContext'

function App() {
  return (
    <SessionProvider>
      <div className='layout'>
        <Routing />
      </div>
    </SessionProvider>
  )
}

export default App
