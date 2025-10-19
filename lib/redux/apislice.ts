import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',  
  baseQuery: fetchBaseQuery({ baseUrl: process.env.BACKEND_URL ,
  prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
    
  }),
  
  endpoints: (builder) => ({
    getUsers: builder.query<any[], void>({
      query: () => 'users',
    }),
    getUserById: builder.query<any, number>({
      query: (id) => `users/${id}`,
    }),
  }),
});

// Export hooks for components
export const { useGetUsersQuery, useGetUserByIdQuery } = apiSlice;