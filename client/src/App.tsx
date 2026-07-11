import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900">Incubyte Project</h1>
      <p className="mt-4 text-lg text-gray-600">React client ready.</p>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
