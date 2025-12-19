import {
  useGetCurrentWeatherByCityQuery,
  useGetHourlyForecastByCityQuery,
} from '@/services/weatherApi';
import styles from '@/styles/page.module.scss';
import { Spinner, Text, Box } from '@chakra-ui/react';
import TemperatureChart from './TemperatureChart';

interface CityDetailsProps {
  city: string;
  onBack: () => void;
}

export default function CityDetails({ city, onBack }: CityDetailsProps) {
  const { data, error, isLoading, isFetching, refetch } = useGetCurrentWeatherByCityQuery(city, {
    skip: !city,
  });

  const {
    data: hourlyData,
    isLoading: isLoadingHourly,
    error: hourlyError,
  } = useGetHourlyForecastByCityQuery(city, {
    skip: !city,
  });

  return (
    <Box className={styles.detailsContainer} display="flex" flexDirection="column" gap="1.5rem">
      <button
        type="button"
        className={styles.buttonGhostBack}
        onClick={onBack}
        style={{ alignSelf: 'flex-start' }}
      >
        ← Back to cities list
      </button>

      <h2 className={styles.title}>Detailed weather: {city}</h2>

      {isLoading ? (
        <Box className={styles.loadingState}>
          <Spinner size="lg" color="purple.500" />
          <Text mt={4} fontSize="md" color="gray.500">
            Loading...
          </Text>
        </Box>
      ) : error ? (
        <Text className={styles.errorState} fontSize="md">
          Failed to load data.
        </Text>
      ) : !data ? (
        <Text className={styles.loadingState} fontSize="md" color="gray.500">
          No data available.
        </Text>
      ) : (
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                {data.name}, {data.sys.country}
              </h2>
              <div className={styles.cardMeta}>
                Current temperature: {Math.round(data.main.temp)}°C
              </div>
            </div>
          </div>

          <div className={styles.tempRow}>
            <span className={styles.tempMain}>{Math.round(data.main.temp)}°C</span>
            <span className={styles.tempFeels}>
              min {Math.round(data.main.temp_min)}°C / max {Math.round(data.main.temp_max)}°C
            </span>
          </div>

          <p className={styles.description}>{data.weather?.[0]?.description}</p>

          <div className={styles.footerRow}>
            <span>Humidity: {data.main.humidity}%</span>
            <span>Pressure: {data.main.pressure} hPa</span>
            <span>Wind: {data.wind.speed} m/s</span>
          </div>

          {(hourlyData?.list || isLoadingHourly || hourlyError) && (
            <Box mt={6}>
              {isLoadingHourly ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="md" color="purple.500" />
                  <Text mt={2} fontSize="sm" color="gray.500">
                    Loading forecast...
                  </Text>
                </Box>
              ) : hourlyError ? (
                <Text fontSize="sm" color="red.500" textAlign="center" py={4}>
                  Failed to load hourly forecast
                </Text>
              ) : hourlyData?.list ? (
                <TemperatureChart hourlyData={hourlyData.list} />
              ) : null}
            </Box>
          )}

          <div className={styles.actions}>
            <button
              className={styles.buttonGhostSuccess}
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Updating...' : 'Update now'}
            </button>
          </div>
        </article>
      )}
    </Box>
  );
}
