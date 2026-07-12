import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQuestionQuery } from '../features/questions/questionsApi';
import { useCreateAnswerMutation } from '../features/answers/answersApi';

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetQuestionQuery(id ?? '', { skip: !id });
  const [answerBody, setAnswerBody] = useState('');
  const [createAnswer, { isLoading: isSubmitting, error: submitError }] = useCreateAnswerMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    try {
      await createAnswer({ questionId: id, body: answerBody }).unwrap();
      setAnswerBody('');
    } catch {
      // error is surfaced via the `submitError` state below
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Failed to load question.</p>;

  const { question, answers } = data;

  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.body}</p>
      {question.tags.length > 0 && <p>Tags: {question.tags.join(', ')}</p>}

      <hr />

      <h2>Answers ({answers.length})</h2>
      <ul>
        {answers.map((answer) => (
          <li key={answer._id}>
            <p>{answer.body}</p>
            <small>{answer.voteCount} votes</small>
          </li>
        ))}
      </ul>

      <h2>Add an answer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea value={answerBody} onChange={(event) => setAnswerBody(event.target.value)} />
        </div>
        {submitError && <p>Failed to submit answer.</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit answer'}
        </button>
      </form>
    </div>
  );
}
