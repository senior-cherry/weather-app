import { render, screen } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import CityDetails from '../CityDetails';
import * as weatherApi from '@/services/weatherApi';
import { mockCurrentWeather, mockHourlyForecast } from '@/__tests__/test-utils';

jest.mock('@/services/weatherApi', () => ({
  useGetCurrentWeatherByCityQuery: jest.fn(),
  useGetHourlyForecastByCityQuery: jest.fn(),
}));

jest.mock('../TemperatureChart', () => {
  return function MockTemperatureChart({ hourlyData }: { hourlyData: unknown[] }) {
    return <div data-testid="temperature-chart">Temperature Chart: {hourlyData.length} items</div>;
  };
});

const mockUseGetCurrentWeatherByCityQuery =
  weatherApi.useGetCurrentWeatherByCityQuery as jest.MockedFunction<
    typeof weatherApi.useGetCurrentWeatherByCityQuery
  >;
const mockUseGetHourlyForecastByCityQuery =
  weatherApi.useGetHourlyForecastByCityQuery as jest.MockedFunction<
    typeof weatherApi.useGetHourlyForecastByCityQuery
  >;

describe('CityDetails', () => {
  const mockOnBack = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetHourlyForecastByCityQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: mockRefetch,
    } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when API returns error', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: undefined,
        error: { status: 404, data: 'Not found' },
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: mockCurrentWeather,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);
    });

    it('should display city name and country in title', () => {
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('Detailed weather: Kyiv')).toBeInTheDocument();
      expect(screen.getByText('Kyiv, UA')).toBeInTheDocument();
    });

    it('should display current temperature', () => {
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText(/Current temperature: 21°C/i)).toBeInTheDocument();
      expect(screen.getByText('21°C')).toBeInTheDocument();
    });

    it('should display min and max temperatures', () => {
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText(/min 18°C \/ max 23°C/i)).toBeInTheDocument();
    });

    it('should display weather description', () => {
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('clear sky')).toBeInTheDocument();
    });

    it('should display humidity, pressure, and wind speed', () => {
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText(/Humidity: 65%/i)).toBeInTheDocument();
      expect(screen.getByText(/Pressure: 1013 hPa/i)).toBeInTheDocument();
      expect(screen.getByText(/Wind: 3.5 m\/s/i)).toBeInTheDocument();
    });

    it('should display hourly forecast chart when data is available', () => {
      mockUseGetHourlyForecastByCityQuery.mockReturnValue({
        data: mockHourlyForecast,
        isLoading: false,
        error: undefined,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByTestId('temperature-chart')).toBeInTheDocument();
      expect(screen.getByText(/Temperature Chart: 2 items/i)).toBeInTheDocument();
    });

    it('should show loading state for hourly forecast', () => {
      mockUseGetHourlyForecastByCityQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('Loading forecast...')).toBeInTheDocument();
    });

    it('should show error message for hourly forecast failure', () => {
      mockUseGetHourlyForecastByCityQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { status: 500, data: 'Server error' },
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('Failed to load hourly forecast')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    beforeEach(() => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: mockCurrentWeather,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);
    });

    it('should call onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back to cities list/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call refetch when Update now button is clicked', async () => {
      const user = userEvent.setup();
      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      const updateButton = screen.getByRole('button', { name: /update now/i });
      await user.click(updateButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should disable Update button when fetching', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: mockCurrentWeather,
        error: undefined,
        isLoading: false,
        isFetching: true,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      const updateButton = screen.getByRole('button', { name: /updating.../i });
      expect(updateButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing weather description gracefully', () => {
      const weatherWithoutDescription = {
        ...mockCurrentWeather,
        weather: [],
      };

      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: weatherWithoutDescription,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);
      expect(screen.getByText('Kyiv, UA')).toBeInTheDocument();
    });

    it('should display "No data available" when data is undefined and not loading', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.getByText('No data available.')).toBeInTheDocument();
    });

    it('should skip API calls when city is empty', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityDetails city="" onBack={mockOnBack} />);

      expect(mockUseGetCurrentWeatherByCityQuery).toHaveBeenCalledWith('', {
        skip: true,
      });
      expect(mockUseGetHourlyForecastByCityQuery).toHaveBeenCalledWith('', {
        skip: true,
      });
    });

    it('should not show hourly forecast when data is not available', () => {
      mockUseGetHourlyForecastByCityQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetHourlyForecastByCityQuery>);

      render(<CityDetails city="Kyiv" onBack={mockOnBack} />);

      expect(screen.queryByTestId('temperature-chart')).not.toBeInTheDocument();
    });
  });
});
