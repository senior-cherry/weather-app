import { useGetCurrentWeatherByCityQuery } from '@/services/weatherApi';
import styles from '@/styles/page.module.scss';
import { Spinner, Text, Box } from '@chakra-ui/react';

interface CityDetailsProps {
  city: string;
  onBack: () => void;
}

export default function CityDetails({ city, onBack }: CityDetailsProps) {
  const { data, error, isLoading, isFetching, refetch } = useGetCurrentWeatherByCityQuery(city, {
    skip: !city,
  });

  return (
    <Box className={styles.page}>
      <button
        type="button"
        className={styles.buttonGhost}
        onClick={onBack}
        style={{ alignSelf: 'flex-start' }}
      >
        ← Back to cities list
      </button>

      <h1 className={styles.title}>Detailed weather: {city}</h1>

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

          <div className={styles.actions}>
            <button
              className={styles.buttonGhost}
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
