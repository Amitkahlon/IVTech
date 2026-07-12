import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useGetQuestionsQuery } from '../features/questions/questionsApi';
import { selectSearchQuery, setSearchQuery } from '../features/questions/questionsSlice';
import { Layout } from '../components/Layout';

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
    <Layout>
      <h1>Latest questions</h1>

      <div className="search-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search questions..."
          />
          <button type="submit">Search</button>
        </form>
        <Link to="/questions/new">
          <button type="button">Ask a question</button>
        </Link>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p className="error-text">Failed to load questions.</p>}
      {data && data.questions.length === 0 && <p>No questions found.</p>}

      <ul className="question-list">
        {data?.questions.map((question) => (
          <li key={question._id} className="question-item">
            <div className="question-stats">
              <div>{question.voteCount} votes</div>
              <div>{question.answerCount} answers</div>
            </div>
            <div className="question-summary">
              <Link to={`/questions/${question._id}`}>{question.title}</Link>
              <div className="meta">
                asked by {question.username ?? 'unknown'}
              </div>
              <div>
                {question.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
