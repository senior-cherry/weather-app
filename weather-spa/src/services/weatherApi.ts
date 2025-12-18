import { CurrentWeather } from '@/types/weather';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.openweathermap.org/data/2.5/',
  }),
  endpoints: (builder) => ({
    getCurrentWeatherByCity: builder.query<CurrentWeather, string>({
      query: (cityName) => ({
        url: 'weather',
        params: {
          q: cityName,
          units: 'metric',
          appid: API_KEY,
        },
      }),
    }),
  }),
});

export const { useGetCurrentWeatherByCityQuery } = weatherApi;
