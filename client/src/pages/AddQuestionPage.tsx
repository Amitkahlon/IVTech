import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateQuestionMutation } from '../features/questions/questionsApi';

export function AddQuestionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [createQuestion, { isLoading, error }] = useCreateQuestionMutation();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await createQuestion({ title, body, tags: tagList }).unwrap();
      navigate('/');
    } catch {
      // error is surfaced via the `error` state below
    }
  };

  return (
    <div>
      <h1>Ask a question</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Body
            <textarea value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Tags (comma separated)
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
        </div>
        {error && <p>Failed to create question.</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
