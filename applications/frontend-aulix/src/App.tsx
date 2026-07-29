import { useState } from 'react'

function App() {
  const [message, _setMessage] = useState("Hello World")

  return (
    <>
      <section id="center">
        {message}
      </section>

    </>
  )
}

export default App
