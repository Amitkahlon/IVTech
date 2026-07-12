import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AddQuestionPage } from './pages/AddQuestionPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions/new" element={<AddQuestionPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
