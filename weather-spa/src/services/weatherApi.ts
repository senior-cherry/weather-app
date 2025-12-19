import { CurrentWeather, HourlyForecast } from '@/types/weather';
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

    getHourlyForecastByCity: builder.query<HourlyForecast, string>({
      async queryFn(cityName, _queryApi, _extraOptions, fetchWithBQ) {
        const weatherResult = await fetchWithBQ({
          url: 'weather',
          params: {
            q: cityName,
            units: 'metric',
            appid: API_KEY,
          },
        });

        if (weatherResult.error) {
          return { error: weatherResult.error };
        }

        const weatherData = weatherResult.data as CurrentWeather;

        const oneCallResult = await fetchWithBQ({
          url: 'https://api.openweathermap.org/data/3.0/onecall',
          params: {
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon,
            exclude: 'minutely,daily,alerts,current',
            units: 'metric',
            appid: API_KEY,
          },
        });

        if (oneCallResult.error) {
          return { error: oneCallResult.error };
        }

        const oneCallData = oneCallResult.data as {
          hourly: Array<{
            dt: number;
            temp: number;
            feels_like: number;
            humidity: number;
            pressure: number;
            weather: Array<{ id: number; main: string; description: string; icon: string }>;
            wind_speed: number;
          }>;
        };

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayHourly = oneCallData.hourly.filter((item) => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate >= today && itemDate < tomorrow;
        });

        return {
          data: {
            list: todayHourly.map((item) => ({
              dt: item.dt,
              main: {
                temp: item.temp,
                feels_like: item.feels_like,
                temp_min: item.temp,
                temp_max: item.temp,
                humidity: item.humidity,
                pressure: item.pressure,
              },
              weather: item.weather,
              wind: {
                speed: item.wind_speed,
              },
            })),
            city: {
              id: weatherData.id,
              name: weatherData.name,
              country: weatherData.sys.country,
            },
          },
        };
      },
    }),
  }),
});

export const { useGetCurrentWeatherByCityQuery, useGetHourlyForecastByCityQuery } = weatherApi;
