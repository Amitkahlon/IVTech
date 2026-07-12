import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="top-bar">
        <Link to="/" className="brand">
          Q&amp;A
        </Link>
        <button onClick={() => dispatch(logout())}>Log out</button>
      </div>
      <div className="page">{children}</div>
    </>
  );
}
