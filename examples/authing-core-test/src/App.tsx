import { Routes, Route } from 'react-router-dom';
import AuthTestPage from './pages/AuthTestPage';
import CallbackPage from './pages/CallbackPage';

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<AuthTestPage />} />
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </div>
  );
}

export default App; 