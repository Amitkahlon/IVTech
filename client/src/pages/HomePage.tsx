import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { useGetQuestionsQuery } from '../features/questions/questionsApi';
import { selectSearchQuery } from '../features/questions/questionsSlice';
import { Layout } from '../components/Layout';
import { formatDate } from '../utils/formatDate';

export function HomePage() {
  const searchQuery = useAppSelector(selectSearchQuery);

  const { data, isLoading, isError } = useGetQuestionsQuery({
    search: searchQuery || undefined,
  });

  return (
    <Layout>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="error-text">Failed to load questions.</p>}
      {data && data.questions.length === 0 && <p>No questions found.</p>}

      <ul className="question-list">
        {data?.questions.map((question) => (
          <li key={question._id} className="question-item">
            <div className="question-stats">
              <div>
                <strong>{question.voteCount}</strong>
                <span>votes</span>
              </div>
              <div>
                <strong>{question.answerCount}</strong>
                <span>answers</span>
              </div>
            </div>
            <div className="question-summary">
              <Link to={`/questions/${question._id}`} className="question-title">
                {question.title}
              </Link>
              <p className="excerpt">{question.body}</p>
              <div className="question-footer">
                <div className="tags">
                  {question.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="meta">
                  asked {formatDate(question.createdAt)}
                  <br />
                  by {question.username ?? 'unknown'}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
