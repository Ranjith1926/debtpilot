import React, { memo } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@theme/ThemeProvider';
import { textVariants } from '@theme/typography';
import { spacing } from '@theme/spacing';

const CHART_WIDTH = Dimensions.get('window').width - 64;

interface BarData { value: number; label: string; frontColor?: string; }
interface LineData { value: number; label?: string; }

interface AnalyticsChartProps {
  type: 'bar' | 'line';
  data: BarData[] | LineData[];
  title?: string;
  height?: number;
  color?: string;
  gradientColor?: string;
  hideRules?: boolean;
  spacing?: number;
}

const AnalyticsChart = memo<AnalyticsChartProps>(({
  type, data, title, height = 180, color, gradientColor, hideRules, spacing: barSpacing,
}) => {
  const { theme } = useTheme();
  const primaryColor = color ?? theme.colors.primary;

  return (
    <View>
      {title && <Text style={[textVariants.titleMedium, { color: theme.colors.textSecondary, marginBottom: spacing[3] }]}>{title}</Text>}
      {type === 'bar' ? (
        <BarChart
          data={data as BarData[]}
          width={CHART_WIDTH}
          height={height}
          barWidth={28}
          spacing={barSpacing ?? 16}
          roundedTop
          hideRules={hideRules}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.colors.border}
          yAxisTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
          noOfSections={4}
          frontColor={primaryColor}
          gradientColor={gradientColor ?? 'rgba(124,58,237,0.2)'}
          showGradient
          isAnimated
          animationDuration={800}
          barBorderRadius={4}
          rulesColor={theme.colors.border}
          rulesType="dashed"
        />
      ) : (
        <LineChart
          data={data as LineData[]}
          width={CHART_WIDTH}
          height={height}
          color={primaryColor}
          thickness={2.5}
          hideRules={hideRules}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.colors.border}
          yAxisTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
          noOfSections={4}
          curved
          isAnimated
          animationDuration={1000}
          startFillColor={`${primaryColor}50`}
          endFillColor="transparent"
          areaChart
          startOpacity={0.4}
          endOpacity={0}
          rulesColor={theme.colors.border}
          rulesType="dashed"
          dataPointsColor={primaryColor}
          dataPointsRadius={4}
        />
      )}
    </View>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';
export default AnalyticsChart;
