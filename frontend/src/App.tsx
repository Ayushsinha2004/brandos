import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PostGenerator from './pages/PostGenerator'
import PostsPage from './pages/PostsPage'
import PostEditor from './pages/PostEditor'
import ContextProfiles from './pages/ContextProfiles'
import ImageGenerator from './pages/ImageGenerator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="generate" element={<PostGenerator />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/:id" element={<PostEditor />} />
          <Route path="context" element={<ContextProfiles />} />
          <Route path="images" element={<ImageGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
