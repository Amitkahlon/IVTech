import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQuestionQuery } from '../features/questions/questionsApi';
import { useCreateAnswerMutation, useVoteAnswerMutation } from '../features/answers/answersApi';
import { Layout } from '../components/Layout';
import { formatDate } from '../utils/formatDate';
import { ANSWER_BODY_MIN, ANSWER_BODY_MAX } from '../utils/validation';

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetQuestionQuery(id ?? '', { skip: !id });
  const [answerBody, setAnswerBody] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [createAnswer, { isLoading: isSubmitting, error: submitError }] = useCreateAnswerMutation();
  const [voteAnswer] = useVoteAnswerMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setValidationError(null);
    const trimmedBody = answerBody.trim();

    if (trimmedBody.length < ANSWER_BODY_MIN || trimmedBody.length > ANSWER_BODY_MAX) {
      setValidationError(`Answer must be between ${ANSWER_BODY_MIN} and ${ANSWER_BODY_MAX} characters.`);
      return;
    }

    try {
      await createAnswer({ questionId: id, body: trimmedBody }).unwrap();
      setAnswerBody('');
    } catch {
      // error is surfaced via the `submitError` state below
    }
  };

  const handleVote = (answerId: string, value: 1 | -1) => {
    if (!id) return;
    voteAnswer({ answerId, value, questionId: id });
  };

  if (isLoading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <p className="error-text">Failed to load question.</p>
      </Layout>
    );
  }

  const { question, answers } = data;

  return (
    <Layout>
      <h1>{question.title}</h1>
      <p className="meta">
        Asked {formatDate(question.createdAt)} by {question.username ?? 'unknown'}
      </p>

      <hr />

      <p>{question.body}</p>
      <div className="tags">
        {question.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <h2>Answers</h2>
      {answers.map((answer) => (
        <div className="answer" key={answer._id}>
          <div className="vote-controls">
            <button
              type="button"
              className={answer.myVote === 1 ? 'vote-active' : undefined}
              onClick={() => handleVote(answer._id, 1)}
              aria-label="Upvote"
              aria-pressed={answer.myVote === 1}
            >
              ▲
            </button>
            <span className="vote-count">{answer.voteCount}</span>
            <button
              type="button"
              className={answer.myVote === -1 ? 'vote-active' : undefined}
              onClick={() => handleVote(answer._id, -1)}
              aria-label="Downvote"
              aria-pressed={answer.myVote === -1}
            >
              ▼
            </button>
          </div>
          <div className="answer-body">
            <p>{answer.body}</p>
            <p className="meta">
              answered {formatDate(answer.createdAt)} by {answer.username ?? 'unknown'}
            </p>
          </div>
        </div>
      ))}

      <hr />

      <form onSubmit={handleSubmit} className="answer-form">
        <textarea
          value={answerBody}
          onChange={(event) => setAnswerBody(event.target.value)}
          placeholder="Type answer here"
          minLength={ANSWER_BODY_MIN}
          maxLength={ANSWER_BODY_MAX}
          required
        />
        {validationError && <p className="error-text">{validationError}</p>}
        {submitError && <p className="error-text">Failed to submit answer.</p>}
        <div className="answer-form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Answer'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
