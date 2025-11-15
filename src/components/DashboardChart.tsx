/**
 * DashboardChart Component - Componente de gráficos para dashboard
 * Implementa Clean Code e SOLID principles
 * Gráficos responsivos usando react-native-chart-kit
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit';

// Types para dados dos gráficos
interface SalesDataPoint {
  date: string;
  sales: number;
}

interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'progress';
  title: string;
  data: any;
  isLoading?: boolean;
  height?: number;
  showGrid?: boolean;
}

interface LineChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }>;
}

interface BarChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
  }>;
}

interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

/**
 * Configuração padrão para gráficos
 */
const getDefaultChartConfig = () => ({
  backgroundColor: '#18181B',
  backgroundGradientFrom: '#18181B',
  backgroundGradientTo: '#18181B',
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // Cor primária do app
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6366F1',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#27272A',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
    fill: '#A1A1AA',
  },
});

/**
 * Função utilitária para truncar labels longos
 */
const truncateLabel = (label: string, maxLength: number = 8): string => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength) + '...';
};

/**
 * Função para formatar datas para labels
 */
const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

/**
 * Hook para obter dimensões da tela
 */
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32; // Margem de 16px de cada lado

/**
 * Componente de gráfico de linha para tendência de vendas
 */
export const SalesLineChart: React.FC<{
  data: SalesDataPoint[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}> = ({ data, title = 'Vendas nos Últimos 30 Dias', isLoading = false, height = 220 }) => {
  
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando gráfico...</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Não há dados para exibir</Text>
        </View>
      </View>
    );
  }

  // Preparar dados para o gráfico
  const chartData: LineChartData = {
    labels: data.slice(-7).map(item => formatDateLabel(item.date)), // Últimos 7 dias
    datasets: [
      {
        data: data.slice(-7).map(item => item.sales),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartData}
          width={Math.max(chartWidth, data.length * 50)}
          height={height}
          chartConfig={getDefaultChartConfig()}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
};

/**
 * Componente de gráfico de barras para produtos mais vendidos
 */
export const TopProductsBarChart: React.FC<{
  data: TopProduct[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}> = ({ data, title = 'Produtos Mais Vendidos', isLoading = false, height = 220 }) => {
  
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando gráfico...</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Não há dados para exibir</Text>
        </View>
      </View>
    );
  }

  // Preparar dados para o gráfico
  const chartData: BarChartData = {
    labels: data.map(product => truncateLabel(product.name)),
    datasets: [
      {
        data: data.map(product => product.totalSold),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={Math.max(chartWidth, data.length * 80)}
          height={height}
          chartConfig={getDefaultChartConfig()}
          style={styles.chart}
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>
    </View>
  );
};

/**
 * Componente de gráfico de pizza para categorias
 */
export const CategoryPieChart: React.FC<{
  data: PieChartData[];
  title?: string;
  isLoading?: boolean;
  height?: number;
}> = ({ data, title = 'Distribuição por Categoria', isLoading = false, height = 220 }) => {
  
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando gráfico...</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Não há dados para exibir</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <PieChart
          data={data}
          width={chartWidth}
          height={height}
          chartConfig={getDefaultChartConfig()}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
};

/**
 * Componente de progresso circular
 */
export const CustomProgressChart: React.FC<{
  data: { data: number[] };
  title?: string;
  isLoading?: boolean;
  height?: number;
}> = ({ data, title = 'Progresso', isLoading = false, height = 220 }) => {
  
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando gráfico...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ProgressChart
        data={data}
        width={chartWidth}
        height={height}
        strokeWidth={16}
        radius={32}
        chartConfig={getDefaultChartConfig()}
        hideLegend={false}
        style={styles.chart}
      />
    </View>
  );
};

/**
 * Componente genérico de gráfico
 */
export const DashboardChart: React.FC<ChartProps> = ({
  type,
  title,
  data,
  isLoading = false,
  height = 220,
}) => {
  
  switch (type) {
    case 'line':
      return (
        <SalesLineChart
          data={data}
          title={title}
          isLoading={isLoading}
          height={height}
        />
      );
    
    case 'bar':
      return (
        <TopProductsBarChart
          data={data}
          title={title}
          isLoading={isLoading}
          height={height}
        />
      );
    
    case 'pie':
      return (
        <CategoryPieChart
          data={data}
          title={title}
          isLoading={isLoading}
          height={height}
        />
      );
    
    case 'progress':
      return (
        <CustomProgressChart
          data={data}
          title={title}
          isLoading={isLoading}
          height={height}
        />
      );
    
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Tipo de gráfico não suportado</Text>
          </View>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  chart: {
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontStyle: 'italic',
  },
});

export default DashboardChart;