'use client';

import { Box, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { HourlyForecastItem } from '@/types/weather';
import { useMemo } from 'react';
import { Chart, useChart } from '@chakra-ui/charts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot,
} from 'recharts';

interface TemperatureChartProps {
  hourlyData: HourlyForecastItem[];
}

export default function TemperatureChart({ hourlyData }: TemperatureChartProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const chartData = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayData = hourlyData
      .filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= today && itemDate < tomorrow;
      })
      .map((item) => {
        const date = new Date(item.dt * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeStr =
          minutes === 0
            ? `${hours}:00`
            : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        return {
          time: timeStr,
          temperature: Math.round(item.main.temp),
          fullTime: date,
          hours,
          minutes,
        };
      });

    if (todayData.length === 0) return null;

    return todayData;
  }, [hourlyData]);

  const chart = useChart({
    data: chartData || [],
    series: [{ name: 'temperature', color: 'purple' }],
  });

  if (!chartData || chartData.length === 0) {
    return (
      <Box
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text color={textColor}>No data to display the graph</Text>
      </Box>
    );
  }

  const formatXAxis = (tickItem: string, index: number) => {
    const item = chartData[index];
    if (!item) return tickItem;

    const isHourStart = item.minutes === 0;
    const isFirstOrLast = index === 0 || index === chartData.length - 1;
    const shouldShow = chartData.length <= 10 || isHourStart || isFirstOrLast;

    return shouldShow ? tickItem : '';
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Temperature throughout the day
      </Text>
      <Chart.Root chart={chart}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chart.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chart.color('purple')} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chart.color('purple')} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              style={{ fill: textColor }}
              fontSize={11}
            />
            <YAxis
              label={{
                value: '°C',
                angle: -90,
                position: 'insideLeft',
                style: { fill: textColor },
              }}
              style={{ fill: textColor }}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}°C`, 'Temperature']}
              labelStyle={{ color: textColor }}
            />
            <Area
              type="monotone"
              dataKey={chart.key('temperature')}
              stroke={chart.color('purple')}
              strokeWidth={3}
              fill="url(#temperatureGradient)"
              fillOpacity={0.6}
              dot={<Dot r={5} fill={chart.color('purple')} stroke={bgColor} strokeWidth={2} />}
              activeDot={{ r: 7, fill: chart.color('purple') }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  );
}
