import { apiSlice } from '../api/apiSlice';
import type { Answer } from '../questions/questionsApi';

interface CreateAnswerRequest {
  questionId: string;
  body: string;
}

export const answersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAnswer: builder.mutation<{ answer: Answer }, CreateAnswerRequest>({
      query: (newAnswer) => ({
        url: '/createAnswer',
        method: 'POST',
        body: newAnswer,
      }),
      invalidatesTags: (_result, _error, { questionId }) => [{ type: 'Question', id: questionId }],
    }),
  }),
});

export const { useCreateAnswerMutation } = answersApi;
