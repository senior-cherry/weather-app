import { useGetCurrentWeatherByCityQuery } from '@/services/weatherApi';
import styles from '@/styles/page.module.scss';
import { Spinner, Text, Box } from '@chakra-ui/react';

interface CityCardProps {
  city: string;
  onRemove: (city: string) => void;
  onOpenDetails: (city: string) => void;
}

export default function CityCard({ city, onRemove, onOpenDetails }: CityCardProps) {
  const { data, error, isLoading, isFetching, refetch } = useGetCurrentWeatherByCityQuery(city);

  const handleOpenDetails = () => {
    onOpenDetails(city);
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <button type="button" onClick={handleOpenDetails} className={styles.cardClickable}>
          <h2 className={styles.cardTitle}>{city}</h2>
          {data?.sys?.country && <div className={styles.cardMeta}>Country: {data.sys.country}</div>}
        </button>
        <button className={styles.buttonDanger} type="button" onClick={() => onRemove(city)}>
          Delete
        </button>
      </div>

      {isLoading ? (
        <Box className={styles.loadingState}>
          <Spinner size="md" color="purple.500" />
          <Text mt={3} fontSize="sm" color="gray.500">
            Loading weather...
          </Text>
        </Box>
      ) : error ? (
        <Text className={styles.errorState} fontSize="sm">
          Failed to load data. Check the city name.
        </Text>
      ) : data ? (
        <button type="button" onClick={handleOpenDetails} className={styles.cardClickable}>
          <div className={styles.tempRow}>
            <span className={styles.tempMain}>{Math.round(data.main.temp)}°C</span>
            <span className={styles.tempFeels}>
              feels like {Math.round(data.main.feels_like)}°C
            </span>
          </div>
          <p className={styles.description}>{data.weather?.[0]?.description}</p>
          <div className={styles.footerRow}>
            <span>Humidity: {data.main.humidity}%</span>
            <span>Wind: {data.wind.speed} m/s</span>
          </div>
        </button>
      ) : (
        <Text className={styles.loadingState} fontSize="sm" color="gray.500">
          No data available.
        </Text>
      )}

      <div className={styles.actions}>
        <button
          className={styles.buttonGhost}
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Updating...' : 'Update now'}
        </button>
        <button className={styles.buttonGhost} type="button" onClick={handleOpenDetails}>
          Detailed information
        </button>
      </div>
    </article>
  );
}
