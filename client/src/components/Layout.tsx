import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { selectSearchQuery, setSearchQuery } from '../features/questions/questionsSlice';
import { AddQuestionModal } from './AddQuestionModal';
import { SEARCH_MAX_LENGTH } from '../utils/validation';

export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchQuery = useAppSelector(selectSearchQuery);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(setSearchQuery(searchInput.trim()));
    navigate('/');
  };

  return (
    <>
      <header className="top-bar">
        <Link to="/" className="logo">
          LOGO
        </Link>
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search"
            maxLength={SEARCH_MAX_LENGTH}
          />
        </form>
        <div className="top-bar-actions">
          <button type="button" onClick={() => setModalOpen(true)}>
            Ask question
          </button>
          <button type="button" className="logout-link" onClick={() => dispatch(logout())}>
            logout
          </button>
        </div>
      </header>
      <div className="page">{children}</div>
      {isModalOpen && <AddQuestionModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
