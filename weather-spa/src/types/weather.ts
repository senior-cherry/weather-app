export interface CurrentWeather {
  id: number;
  name: string;
  dt: number;
  coord: {
    lat: number;
    lon: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

export interface HourlyForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: {
    speed: number;
  };
}

export interface HourlyForecast {
  list: HourlyForecastItem[];
  city: {
    id: number;
    name: string;
    country: string;
  };
}
