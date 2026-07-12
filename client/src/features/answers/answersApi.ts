import { apiSlice } from '../api/apiSlice';
import type { Answer } from '../questions/questionsApi';

interface CreateAnswerRequest {
  questionId: string;
  body: string;
}

interface VoteAnswerRequest {
  answerId: string;
  value: 1 | -1;
  // Not sent to the server; only used to invalidate the right question's cache.
  questionId: string;
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
    voteAnswer: builder.mutation<{ voted: boolean; value?: 1 | -1 }, VoteAnswerRequest>({
      query: ({ answerId, value }) => ({
        url: '/voteAnswer',
        method: 'POST',
        body: { answerId, value },
      }),
      invalidatesTags: (_result, _error, { questionId }) => [{ type: 'Question', id: questionId }],
    }),
  }),
});

export const { useCreateAnswerMutation, useVoteAnswerMutation } = answersApi;
