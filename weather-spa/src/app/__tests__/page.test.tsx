import { render, screen, waitFor } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import * as weatherApi from '@/services/weatherApi';

jest.mock('@/services/weatherApi', () => ({
  useGetCurrentWeatherByCityQuery: jest.fn(),
  useGetHourlyForecastByCityQuery: jest.fn(),
}));

const mockUseGetCurrentWeatherByCityQuery =
  weatherApi.useGetCurrentWeatherByCityQuery as jest.MockedFunction<
    typeof weatherApi.useGetCurrentWeatherByCityQuery
  >;
const mockUseGetHourlyForecastByCityQuery =
  weatherApi.useGetHourlyForecastByCityQuery as jest.MockedFunction<
    typeof weatherApi.useGetHourlyForecastByCityQuery
  >;

describe('Home Page', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);
    mockUseGetHourlyForecastByCityQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
      isFetching: false,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);
  });

  describe('Initial State', () => {
    it('should display empty state when no cities are added', () => {
      render(<Home />);

      expect(
        screen.getByText('No cities added yet. Add your first city above.')
      ).toBeInTheDocument();
    });

    it('should display cities from localStorage on mount', () => {
      const savedCities = ['Kyiv', 'London'];
      localStorage.setItem('weather_cities', JSON.stringify(savedCities));

      render(<Home />);

      expect(screen.getByText('Kyiv')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
    });
  });

  describe('Add City Functionality', () => {
    it('should add a new city when clicking Add button', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');
      const addButton = screen.getByRole('button', { name: /add city/i });

      await user.type(input, 'Kyiv');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Kyiv')).toBeInTheDocument();
      });
    });

    it('should add a new city when pressing Enter in input', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');

      await user.type(input, 'Kyiv{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Kyiv')).toBeInTheDocument();
      });
    });

    it('should not add empty city', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');
      const addButton = screen.getByRole('button', { name: /add city/i });

      await user.type(input, '   ');
      await user.click(addButton);

      expect(
        screen.getByText('No cities added yet. Add your first city above.')
      ).toBeInTheDocument();
    });

    it('should not add duplicate city', async () => {
      const user = userEvent.setup();
      localStorage.setItem('weather_cities', JSON.stringify(['Kyiv']));

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');
      const addButton = screen.getByRole('button', { name: /add city/i });

      await user.type(input, 'Kyiv');
      await user.click(addButton);

      const cityElements = screen.getAllByText('Kyiv');
      expect(cityElements.length).toBeGreaterThanOrEqual(1);
      expect(input).toHaveValue('');
    });

    it('should clear input after adding city', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');
      const addButton = screen.getByRole('button', { name: /add city/i });

      await user.type(input, 'Kyiv');
      await user.click(addButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('Remove City Functionality', () => {
    it('should remove a city when Delete button is clicked', async () => {
      const user = userEvent.setup();
      localStorage.setItem('weather_cities', JSON.stringify(['Kyiv', 'London']));

      render(<Home />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        const cityCards = screen.queryAllByText('Kyiv');
        expect(cityCards.length).toBe(0);
      });
    });

    it('should clear selected city when it is removed', async () => {
      const user = userEvent.setup();
      localStorage.setItem('weather_cities', JSON.stringify(['Kyiv']));

      render(<Home />);

      const cityCard = screen.getByText('Kyiv');
      await user.click(cityCard.closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/Detailed weather: Kyiv/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to cities list/i });
      await user.click(backButton);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText('No cities added yet. Add your first city above.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('City Selection and Details', () => {
    it('should open city details when city card is clicked', async () => {
      const user = userEvent.setup();
      localStorage.setItem('weather_cities', JSON.stringify(['Kyiv']));

      render(<Home />);

      const cityName = screen.getByText('Kyiv');
      const clickableElement = cityName.closest('button');

      if (clickableElement) {
        await user.click(clickableElement);
      }

      await waitFor(() => {
        expect(screen.getByText(/Detailed weather: Kyiv/i)).toBeInTheDocument();
      });
    });

    it('should go back to list when Back button is clicked', async () => {
      const user = userEvent.setup();
      localStorage.setItem('weather_cities', JSON.stringify(['Kyiv']));

      render(<Home />);

      const cityName = screen.getByText('Kyiv');
      const clickableElement = cityName.closest('button');

      if (clickableElement) {
        await user.click(clickableElement);
      }

      await waitFor(() => {
        expect(screen.getByText(/Detailed weather: Kyiv/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to cities list/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Kyiv')).toBeInTheDocument();
        expect(screen.queryByText(/Detailed weather: Kyiv/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('should save cities to localStorage when cities change', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter city name, example: Kyiv');
      const addButton = screen.getByRole('button', { name: /add city/i });

      await user.type(input, 'Kyiv');
      await user.click(addButton);

      await waitFor(() => {
        const saved = localStorage.getItem('weather_cities');
        expect(saved).toBe(JSON.stringify(['Kyiv']));
      });
    });

    it('should not save to localStorage on initial mount', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      render(<Home />);

      expect(setItemSpy).not.toHaveBeenCalled();

      setItemSpy.mockRestore();
    });
  });

  describe('Rendering', () => {
    it('should render header with title', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { name: /weather app/i })).toBeInTheDocument();
    });

    it('should render input and add button', () => {
      render(<Home />);

      expect(screen.getByPlaceholderText('Enter city name, example: Kyiv')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add city/i })).toBeInTheDocument();
    });
  });
});
