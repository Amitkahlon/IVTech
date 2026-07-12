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

export interface QuestionWithCounts extends Question {
  answerCount: number;
  voteCount: number;
}

export interface GetQuestionsParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface GetQuestionsResponse {
  questions: QuestionWithCounts[];
  page: number;
  limit: number;
}

export const questionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createQuestion: builder.mutation<{ question: Question }, CreateQuestionRequest>({
      query: (newQuestion) => ({
        url: '/createQuestion',
        method: 'POST',
        body: newQuestion,
      }),
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),
    getQuestions: builder.query<GetQuestionsResponse, GetQuestionsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set('search', params.search);
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        const queryString = searchParams.toString();
        return `/getQuestions${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.questions.map((question) => ({ type: 'Question' as const, id: question._id })),
              { type: 'Question' as const, id: 'LIST' },
            ]
          : [{ type: 'Question' as const, id: 'LIST' }],
    }),
  }),
});

export const { useCreateQuestionMutation, useGetQuestionsQuery } = questionsApi;
