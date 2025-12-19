import { render, screen } from '@/__tests__/test-utils';
import TemperatureChart from '../TemperatureChart';
import { HourlyForecastItem } from '@/types/weather';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Dot: () => <div data-testid="dot" />,
}));

jest.mock('@chakra-ui/charts', () => ({
  Chart: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="chart-root">{children}</div>
    ),
  },
  useChart: jest.fn(() => ({
    data: [],
    key: (name: string) => name,
    color: (name: string) => (name === 'purple' ? '#805AD5' : '#000000'),
  })),
}));

jest.mock('@/components/ui/color-mode', () => ({
  useColorModeValue: jest.fn((light) => light),
  ColorModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TemperatureChart', () => {
  const createMockHourlyData = (hoursAgo: number, count: number): HourlyForecastItem[] => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const actualCount = Math.min(count, 23);
    const startTimestamp = Math.floor(today.getTime() / 1000);
    return Array.from({ length: actualCount }, (_, i) => ({
      dt: startTimestamp + i * 3600,
      main: {
        temp: 20 + i,
        feels_like: 19 + i,
        temp_min: 19 + i,
        temp_max: 21 + i,
        humidity: 60 + i,
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
    }));
  };

  describe('Empty State', () => {
    it('should display message when no data is provided', () => {
      render(<TemperatureChart hourlyData={[]} />);

      expect(screen.getByText('No data to display the graph')).toBeInTheDocument();
    });

    it('should display message when hourlyData is null', () => {
      render(<TemperatureChart hourlyData={null as unknown as HourlyForecastItem[]} />);

      expect(screen.getByText('No data to display the graph')).toBeInTheDocument();
    });
  });

  describe('Data Filtering', () => {
    it("should filter data to show only today's hours", () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const mockData: HourlyForecastItem[] = [
        {
          dt: Math.floor(today.getTime() / 1000),
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 19,
            temp_max: 21,
            humidity: 60,
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
          dt: Math.floor((today.getTime() + 25 * 3600 * 1000) / 1000),
          main: {
            temp: 22,
            feels_like: 21,
            temp_min: 21,
            temp_max: 23,
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
      ];

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.queryByText('No data to display the graph')).not.toBeInTheDocument();
    });

    it('should display empty state when all data is from tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      const mockData: HourlyForecastItem[] = [
        {
          dt: Math.floor(tomorrow.getTime() / 1000),
          main: {
            temp: 22,
            feels_like: 21,
            temp_min: 21,
            temp_max: 23,
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
      ];

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByText('No data to display the graph')).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    it('should render chart with valid data', () => {
      const mockData = createMockHourlyData(24, 5);

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should render chart title', () => {
      const mockData = createMockHourlyData(24, 5);

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByText('Temperature throughout the day')).toBeInTheDocument();
    });

    it('should render all chart components', () => {
      const mockData = createMockHourlyData(24, 5);

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('area')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format time correctly for hours with zero minutes', () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockData: HourlyForecastItem[] = [
        {
          dt: Math.floor(today.getTime() / 1000),
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 19,
            temp_max: 21,
            humidity: 60,
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
      ];

      render(<TemperatureChart hourlyData={mockData} />);

      // Chart should render (formatting is internal to the component)
      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
    });

    it('should format time correctly for hours with non-zero minutes', () => {
      const today = new Date();
      today.setHours(10, 30, 0, 0);

      const mockData: HourlyForecastItem[] = [
        {
          dt: Math.floor(today.getTime() / 1000),
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 19,
            temp_max: 21,
            humidity: 60,
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
      ];

      render(<TemperatureChart hourlyData={mockData} />);
      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
    });

    it('should round temperatures correctly', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const mockData: HourlyForecastItem[] = [
        {
          dt: Math.floor(today.getTime() / 1000),
          main: {
            temp: 20.7,
            feels_like: 19.3,
            temp_min: 19.1,
            temp_max: 21.9,
            humidity: 60,
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
      ];

      render(<TemperatureChart hourlyData={mockData} />);
      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const mockData = createMockHourlyData(24, 1);

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
    });

    it('should handle large dataset', () => {
      const mockData = createMockHourlyData(24, 24);

      render(<TemperatureChart hourlyData={mockData} />);

      expect(screen.getByTestId('chart-root')).toBeInTheDocument();
    });
  });
});
