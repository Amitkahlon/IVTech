import { useState, type FormEvent } from 'react';
import { useCreateQuestionMutation } from '../features/questions/questionsApi';

export function AddQuestionModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [createQuestion, { isLoading, error }] = useCreateQuestionMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await createQuestion({ title, body, tags: tagList }).unwrap();
      onClose();
    } catch {
      // error is surfaced via the `error` state below
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Ask Question</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Question
            <textarea value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <label>
            Tags separated by ,
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          {error && <p className="error-text">Failed to create question.</p>}
          <div className="modal-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
