import { apiSlice } from '../api/apiSlice';

interface CreateQuestionRequest {
  title: string;
  body: string;
  tags: string[];
}

export interface Question {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  username?: string;
  createdAt: string;
}

export interface QuestionWithCounts extends Question {
  answerCount: number;
  voteCount: number;
}

export interface Answer {
  _id: string;
  body: string;
  questionId: string;
  authorId: string;
  username?: string;
  createdAt: string;
  voteCount: number;
  myVote?: 1 | -1;
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

interface GetQuestionResponse {
  question: Question;
  answers: Answer[];
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
    getQuestion: builder.query<GetQuestionResponse, string>({
      query: (id) => `/getQuestionAnswer/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Question', id }],
    }),
  }),
});

export const { useCreateQuestionMutation, useGetQuestionsQuery, useGetQuestionQuery } = questionsApi;
