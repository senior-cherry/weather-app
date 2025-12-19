import { render, screen } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import CityCard from '../CityCard';
import * as weatherApi from '@/services/weatherApi';
import { mockCurrentWeather } from '@/__tests__/test-utils';

jest.mock('@/services/weatherApi', () => ({
  useGetCurrentWeatherByCityQuery: jest.fn(),
}));

const mockUseGetCurrentWeatherByCityQuery =
  weatherApi.useGetCurrentWeatherByCityQuery as jest.MockedFunction<
    typeof weatherApi.useGetCurrentWeatherByCityQuery
  >;

describe('CityCard', () => {
  const mockOnRemove = jest.fn();
  const mockOnOpenDetails = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText('Loading weather...')).toBeDefined();
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

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);
      expect(screen.getByText('Failed to load data. Check the city name.')).toBeDefined();
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

    it('should display city name', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText('Kyiv')).toBeDefined();
    });

    it('should display country code when available', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText(/Country: UA/i)).toBeDefined();
    });

    it('should display temperature correctly', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText('21°C')).toBeDefined();
    });

    it('should display feels like temperature', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText(/feels like 20°C/i)).toBeDefined();
    });

    it('should display weather description', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText('clear sky')).toBeDefined();
    });

    it('should display humidity and wind speed', () => {
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText(/Humidity: 65%/i)).toBeDefined();
      expect(screen.getByText(/Wind: 3.5 m\/s/i)).toBeDefined();
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

    it('should call onOpenDetails when city name is clicked', async () => {
      const user = userEvent.setup();
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      const cityName = screen.getByText('Kyiv');
      const clickableButton = cityName.closest('button');

      if (clickableButton) {
        await user.click(clickableButton);
      }

      expect(mockOnOpenDetails).toHaveBeenCalledWith('Kyiv');
    });

    it('should call onRemove when Delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnRemove).toHaveBeenCalledWith('Kyiv');
    });

    it('should call refetch when Update now button is clicked', async () => {
      const user = userEvent.setup();
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

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

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      const updateButton = screen.getByRole('button', { name: /updating.../i });
      expect(updateButton).toBeDisabled();
    });

    it('should call onOpenDetails when Detailed information button is clicked', async () => {
      const user = userEvent.setup();
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      const detailsButton = screen.getByRole('button', { name: /detailed information/i });
      await user.click(detailsButton);

      expect(mockOnOpenDetails).toHaveBeenCalledWith('Kyiv');
    });

    it('should call onOpenDetails when temperature area is clicked', async () => {
      const user = userEvent.setup();
      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      const tempButton = screen.getByText('21°C').closest('button');

      if (tempButton) {
        await user.click(tempButton);
      }

      expect(mockOnOpenDetails).toHaveBeenCalledWith('Kyiv');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing country code gracefully', () => {
      const weatherWithoutCountry = {
        ...mockCurrentWeather,
        sys: { country: '' },
      };

      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: weatherWithoutCountry,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      } as ReturnType<typeof weatherApi.useGetCurrentWeatherByCityQuery>);

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.queryByText(/Country:/i)).not.toBeInTheDocument();
    });

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

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText('Kyiv')).toBeInTheDocument();
    });

    it('should display "No data available" when data is undefined and not loading', () => {
      mockUseGetCurrentWeatherByCityQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });

      render(<CityCard city="Kyiv" onRemove={mockOnRemove} onOpenDetails={mockOnOpenDetails} />);

      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
  });
});
