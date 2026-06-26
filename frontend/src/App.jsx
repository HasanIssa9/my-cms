import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LangProvider } from './i18n.jsx';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Posts from './pages/Posts.jsx';
import EditPost from './pages/EditPost.jsx';
import Media from './pages/Media.jsx';
import Settings from './pages/Settings.jsx';

function RequireAuth({ children }) {
  return localStorage.getItem('cms_token') ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <LangProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="pages" element={<Posts type="page" />} />
          <Route path="pages/new" element={<EditPost type="page" />} />
          <Route path="pages/:id" element={<EditPost type="page" />} />
          <Route path="media" element={<Media />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
    </LangProvider>
  );
}

