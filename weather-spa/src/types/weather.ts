export interface CurrentWeather {
  id: number;
  name: string;
  dt: number;
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
