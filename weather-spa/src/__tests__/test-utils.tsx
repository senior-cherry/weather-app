import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ColorModeProvider } from '@/components/ui/color-mode';

function createTestStore() {
  return configureStore({
    reducer: {
      weatherApi: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });
}

interface AllTheProvidersProps {
  children: React.ReactNode;
  store?: Store;
}

function AllTheProviders({ children, store }: AllTheProvidersProps) {
  const testStore = store || createTestStore();
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <Provider store={testStore}>{children}</Provider>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: Store;
}

const customRender = (ui: ReactElement, { store, ...renderOptions }: CustomRenderOptions = {}) => {
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

export const mockCurrentWeather = {
  id: 1,
  name: 'Kyiv',
  dt: Math.floor(Date.now() / 1000),
  coord: {
    lat: 50.4501,
    lon: 30.5234,
  },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  main: {
    temp: 20.5,
    feels_like: 19.8,
    temp_min: 18.0,
    temp_max: 23.0,
    humidity: 65,
    pressure: 1013,
  },
  wind: {
    speed: 3.5,
  },
  sys: {
    country: 'UA',
  },
};

export const mockHourlyForecast = {
  list: [
    {
      dt: Math.floor(Date.now() / 1000),
      main: {
        temp: 20.5,
        feels_like: 19.8,
        temp_min: 20.0,
        temp_max: 21.0,
        humidity: 65,
        pressure: 1013,
      },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      wind: {
        speed: 3.5,
      },
    },
    {
      dt: Math.floor(Date.now() / 1000) + 3600,
      main: {
        temp: 21.0,
        feels_like: 20.2,
        temp_min: 20.5,
        temp_max: 21.5,
        humidity: 62,
        pressure: 1012,
      },
      weather: [
        {
          id: 801,
          main: 'Clouds',
          description: 'few clouds',
          icon: '02d',
        },
      ],
      wind: {
        speed: 4.0,
      },
    },
  ],
  city: {
    id: 1,
    name: 'Kyiv',
    country: 'UA',
  },
};

export * from '@testing-library/react';
export { customRender as render };
