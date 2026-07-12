import { useState, type FormEvent } from 'react';
import { useCreateQuestionMutation } from '../features/questions/questionsApi';
import {
  QUESTION_TITLE_MIN,
  QUESTION_TITLE_MAX,
  QUESTION_BODY_MIN,
  QUESTION_BODY_MAX,
  TAG_MAX_LENGTH,
  TAGS_MAX_COUNT,
} from '../utils/validation';

export function AddQuestionModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [createQuestion, { isLoading, error }] = useCreateQuestionMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (trimmedTitle.length < QUESTION_TITLE_MIN || trimmedTitle.length > QUESTION_TITLE_MAX) {
      setValidationError(`Title must be between ${QUESTION_TITLE_MIN} and ${QUESTION_TITLE_MAX} characters.`);
      return;
    }

    if (trimmedBody.length < QUESTION_BODY_MIN || trimmedBody.length > QUESTION_BODY_MAX) {
      setValidationError(`Question must be between ${QUESTION_BODY_MIN} and ${QUESTION_BODY_MAX} characters.`);
      return;
    }

    if (tagList.length > TAGS_MAX_COUNT || tagList.some((tag) => tag.length > TAG_MAX_LENGTH)) {
      setValidationError(`Up to ${TAGS_MAX_COUNT} tags allowed, each up to ${TAG_MAX_LENGTH} characters.`);
      return;
    }

    try {
      await createQuestion({ title: trimmedTitle, body: trimmedBody, tags: tagList }).unwrap();
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
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={QUESTION_TITLE_MIN}
              maxLength={QUESTION_TITLE_MAX}
              required
            />
          </label>
          <label>
            Question
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              minLength={QUESTION_BODY_MIN}
              maxLength={QUESTION_BODY_MAX}
              required
            />
          </label>
          <label>
            Tags separated by , (up to {TAGS_MAX_COUNT})
            <input value={tags} onChange={(event) => setTags(event.target.value)} />
          </label>
          {validationError && <p className="error-text">{validationError}</p>}
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
