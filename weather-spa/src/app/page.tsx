'use client';

import { useEffect, useState, useRef } from 'react';
import styles from '../styles/page.module.scss';
import CityCard from '@/components/weather/CityCard';
import CityDetails from '@/components/weather/CityDetails';
import { Box, Text, Spinner } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';

const STORAGE_KEY = 'weather_cities';

function loadCitiesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadedCities = loadCitiesFromStorage();
    requestAnimationFrame(() => {
      setCities(loadedCities);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  }, [cities]);

  const handleAddCity = () => {
    const trimmed = newCity.trim();
    if (!trimmed) return;

    if (cities.includes(trimmed)) {
      setNewCity('');
      return;
    }

    setCities((prev) => [...prev, trimmed]);
    setNewCity('');
  };

  const handleRemoveCity = (city: string) => {
    setCities((prev) => prev.filter((c) => c !== city));

    if (selectedCity === city) {
      setSelectedCity(null);
    }
  };

  const handleOpenDetails = (city: string) => {
    setSelectedCity(city);
  };

  const handleBackToList = () => {
    setSelectedCity(null);
  };

  return (
    <Box className={styles.page}>
      <Box as="header" className={styles.header}>
        <h1 className={styles.title}>Weather App</h1>
      </Box>

      {!selectedCity && (
        <div className={styles.form}>
          <Tooltip
            content="Example: Kyiv"
            showArrow
            contentProps={{
              px: 4,
              py: 2,
              fontSize: 'sm',
              fontWeight: 'medium',
              borderRadius: 'md',
            }}
          >
            <input
              className={styles.input}
              placeholder="Enter city name"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCity();
                }
              }}
            />
          </Tooltip>
          <button className={styles.buttonPrimary} type="button" onClick={handleAddCity}>
            Add city
          </button>
        </div>
      )}

      {selectedCity ? (
        <CityDetails city={selectedCity} onBack={handleBackToList} />
      ) : isLoading ? (
        <Box className={styles.loadingContainer}>
          <Spinner size="lg" color="purple.500" />
        </Box>
      ) : cities.length === 0 ? (
        <Text className={styles.empty}>No cities added yet. Add your first city above.</Text>
      ) : (
        <div className={styles.grid}>
          {cities.map((city) => (
            <CityCard
              key={city}
              city={city}
              onRemove={handleRemoveCity}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}
    </Box>
  );
}
