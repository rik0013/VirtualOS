import { useState } from 'react'
import VirtualOS from './VirtualOS'
import { BootScreen } from './components/BootScreen'

function App() {
  const [booted, setBooted] = useState(false)

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />
  }

  return <VirtualOS />
}

export default App