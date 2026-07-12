import { apiSlice } from '../api/apiSlice';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresIn: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
