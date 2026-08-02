import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav.jsx'
import { ScrollManager } from './components/ScrollManager.jsx'
import Home from './pages/Home.jsx'

const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <>
      <Nav />
      <ScrollManager />
      <main id="main">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}
