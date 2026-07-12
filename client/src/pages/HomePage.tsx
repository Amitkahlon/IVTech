import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

export function HomePage() {
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>You are logged in.</h1>
      <button onClick={() => dispatch(logout())}>Log out</button>
    </div>
  );
}
