import { apiSlice } from '../api/apiSlice';

interface CreateQuestionRequest {
  title: string;
  body: string;
  tags: string[];
}

interface Question {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  createdAt: string;
}

export const questionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuestion: builder.mutation<{ question: Question }, CreateQuestionRequest>({
      query: (newQuestion) => ({
        url: '/createQuestion',
        method: 'POST',
        body: newQuestion,
      }),
    }),
  }),
});

export const { useCreateQuestionMutation } = questionsApi;
