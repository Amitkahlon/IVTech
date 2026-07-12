import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useGetQuestionsQuery } from '../features/questions/questionsApi';
import { selectSearchQuery, setSearchQuery } from '../features/questions/questionsSlice';

export function HomePage() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const { data, isLoading, isError } = useGetQuestionsQuery({
    search: searchQuery || undefined,
  });

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(setSearchQuery(searchInput.trim()));
  };

  return (
    <div>
      <h1>You are logged in.</h1>
      <Link to="/questions/new">Ask a question</Link>
      <br />
      <button onClick={() => dispatch(logout())}>Log out</button>

      <hr />

      <form onSubmit={handleSearchSubmit}>
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search questions..."
        />
        <button type="submit">Search</button>
      </form>

      <h2>Latest questions</h2>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Failed to load questions.</p>}
      {data && data.questions.length === 0 && <p>No questions found.</p>}
      <ul>
        {data?.questions.map((question) => (
          <li key={question._id}>
            <Link to={`/questions/${question._id}`}>
              <strong>{question.title}</strong>
            </Link>{' '}
            — {question.answerCount} answers, {question.voteCount} votes
            {question.tags.length > 0 && <> [{question.tags.join(', ')}]</>}
          </li>
        ))}
      </ul>
    </div>
  );
}
