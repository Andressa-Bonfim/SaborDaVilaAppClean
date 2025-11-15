/**
 * DashboardScreen - Tela principal do dashboard
 * Implementa Clean Code e SOLID principles
 * Dashboard completo com KPIs, gráficos e métricas
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardCard } from '../../components/DashboardCard';
import {
  SalesLineChart,
  TopProductsBarChart,
  DashboardChart,
} from '../../components/DashboardChart';
import { Button } from '../../components/Button';
import { seedDatabase } from '../../database/seedData';
import { Settings, DollarSign, Calendar, BarChart2, Target, Package, Warehouse, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react-native';

/**
 * Interface para props do componente
 */
interface DashboardScreenProps {}

/**
 * Hook para obter dimensões da tela
 */
const { width: screenWidth } = Dimensions.get('window');

/**
 * Componente principal da tela Dashboard
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const { activeShop, isAdmin } = useAuth();
  const {
    data: dashboardData,
    isLoading,
    error,
    lastUpdated,
    refresh,
  } = useDashboard(activeShop?.id);

  console.log(`📊 Dashboard: Renderizando tela - Loja ${activeShop?.id}`);

  /**
   * Função para formatar data da última atualização
   */
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return '';
    return `Última atualização: ${date.toLocaleTimeString('pt-BR')}`;
  };

  /**
   * Função para lidar com refresh manual
   */
  const handleRefresh = async () => {
    console.log('🔄 Dashboard: Refresh manual solicitado');
    try {
      await refresh();
    } catch (error) {
      console.error('❌ Dashboard: Erro no refresh:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    }
  };

  /**
   * Função para popular dados de exemplo
   */
  const handleSeedData = async () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa selecionada');
      return;
    }

    Alert.alert(
      'Dados de Exemplo',
      'Deseja adicionar dados de exemplo para demonstração dos KPIs?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async () => {
            try {
              console.log('🌱 Dashboard: Populando dados de exemplo');
              await seedDatabase(activeShop.id);
              await refresh(); // Recarregar dados após popular
              Alert.alert('Sucesso', 'Dados de exemplo adicionados com sucesso!');
            } catch (error) {
              console.error('❌ Dashboard: Erro ao popular dados:', error);
              Alert.alert('Erro', 'Não foi possível adicionar dados de exemplo');
            }
          }
        }
      ]
    );
  };

  /**
   * Renderizar loading state
   */
  const renderLoadingState = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Settings color="#FFFFFF" size={28} style={styles.titleIcon} />
          <Text style={styles.title}>Dashboard</Text>
        </View>
        {activeShop && (
          <Text style={styles.shopName}>{activeShop.nomeDaLoja}</Text>
        )}
      </View>

      {/* Cards de loading */}
      <View style={styles.kpiGrid}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.kpiCard}>
            <DashboardCard
              title="Carregando..."
              value="..."
              isLoading={true}
              variant="compact"
            />
          </View>
        ))}
      </View>

      <View style={styles.chartSection}>
        <View style={styles.sectionTitleContainer}>
          <TrendingUp color="#FFFFFF" size={20} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Gráficos</Text>
        </View>
        <DashboardChart
          type="line"
          title="Vendas dos Últimos Dias"
          data={[]}
          isLoading={true}
        />
        <DashboardChart
          type="bar"
          title="Produtos Mais Vendidos"
          data={[]}
          isLoading={true}
        />
      </View>
    </ScrollView>
  );

  /**
   * Renderizar estado de erro
   */
  const renderErrorState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboard</Text>
        {activeShop && (
          <Text style={styles.shopName}>{activeShop.nomeDaLoja}</Text>
        )}
      </View>

      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Tentar Novamente"
          onPress={handleRefresh}
        />
      </View>
    </View>
  );

  /**
   * Renderizar estado sem loja selecionada
   */
  const renderNoShopState = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Settings color="#FFFFFF" size={28} style={styles.titleIcon} />
          <Text style={styles.title}>Dashboard</Text>
        </View>
      </View>

      <View style={styles.noShopContainer}>
        <Text style={styles.noShopText}>
          Selecione uma loja para visualizar o dashboard
        </Text>
      </View>
    </View>
  );

  /**
   * Renderizar conteúdo principal
   */
  const renderMainContent = () => {
    if (!dashboardData) {
      return null;
    }

    const { daily, weekly, monthly, averageTicket, stockMetrics, topProducts, salesLast30Days } = dashboardData;

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Settings color="#FFFFFF" size={28} style={styles.titleIcon} />
            <Text style={styles.title}>Dashboard</Text>
          </View>
          {activeShop && (
            <Text style={styles.shopName}>{activeShop.nomeDaLoja}</Text>
          )}
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              {formatLastUpdated(lastUpdated)}
            </Text>
          )}
          
          {/* Botão para adicionar dados de exemplo se não há vendas ou para admins */}
          {(daily.totalSales === 0 || isAdmin) && (
            <View style={styles.seedDataContainer}>
              <Button
                title="Adicionar Dados de Exemplo"
                onPress={handleSeedData}
                variant="secondary"
                icon={<Database color="#6366F1" size={16} />}
              />
            </View>
          )}
        </View>

        {/* KPI Cards Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <DashboardCard
              title="Vendas Hoje"
              value={daily.totalSales}
              subtitle={`${daily.salesCount} vendas • ${daily.itemsSold} itens`}
              variant="highlighted"
              icon={<DollarSign color="#6366F1" size={20} />}
            />
          </View>

          <View style={styles.kpiCard}>
            <DashboardCard
              title="Vendas Semana"
              value={weekly.totalSales}
              subtitle={`${weekly.salesCount} vendas • ${weekly.itemsSold} itens`}
              icon={<Calendar color="#6366F1" size={20} />}
            />
          </View>

          <View style={styles.kpiCard}>
            <DashboardCard
              title="Vendas Mês"
              value={monthly.totalSales}
              subtitle={`${monthly.salesCount} vendas • ${monthly.itemsSold} itens`}
              icon={<BarChart2 color="#6366F1" size={20} />}
            />
          </View>

          <View style={styles.kpiCard}>
            <DashboardCard
              title="Ticket Médio"
              value={averageTicket}
              subtitle="Últimos 30 dias"
              icon={<Target color="#6366F1" size={20} />}
            />
          </View>
        </View>

        {/* Stock Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Package color="#FFFFFF" size={20} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Estoque</Text>
          </View>
          
          <View style={styles.stockGrid}>
            <View style={styles.stockCard}>
              <DashboardCard
                title="Produtos"
                value={stockMetrics.totalProducts}
                variant="compact"
                icon={<Package color="#6366F1" size={16} />}
              />
            </View>

            <View style={styles.stockCard}>
              <DashboardCard
                title="Itens em Estoque"
                value={stockMetrics.totalStockItems}
                variant="compact"
                icon={<Warehouse color="#6366F1" size={16} />}
              />
            </View>

            <View style={styles.stockCard}>
              <DashboardCard
                title="Valor do Estoque"
                value={stockMetrics.totalStockValue}
                variant="compact"
                icon={<DollarSign color="#6366F1" size={16} />}
              />
            </View>

            <View style={styles.stockCard}>
              <DashboardCard
                title="Estoque Baixo"
                value={stockMetrics.lowStockCount}
                subtitle={`${stockMetrics.lowStockProducts.length} produtos`}
                variant="compact"
                color={stockMetrics.lowStockCount > 0 ? '#EF4444' : '#22C55E'}
                icon={stockMetrics.lowStockCount > 0 ? <AlertTriangle color="#EF4444" size={16} /> : <CheckCircle color="#22C55E" size={16} />}
              />
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartSection}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp color="#FFFFFF" size={20} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Gráficos</Text>
          </View>
          
          {/* Sales Trend Chart */}
          <SalesLineChart
            data={salesLast30Days}
            title="Tendência de Vendas (Últimos 7 dias)"
          />

          {/* Top Products Chart */}
          {topProducts.length > 0 && (
            <TopProductsBarChart
              data={topProducts}
              title="Top 5 Produtos Mais Vendidos"
            />
          )}
        </View>

        {/* Actions Section (apenas para admin) */}
        {isAdmin && (
          <View style={styles.actionsSection}>
            <View style={styles.sectionTitleContainer}>
              <Settings color="#FFFFFF" size={20} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Ações</Text>
            </View>
            <View style={styles.refreshButton}>
              <Button
                title="Atualizar Dados"
                onPress={handleRefresh}
              />
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  // Estados condicionais
  if (!activeShop) {
    return renderNoShopState();
  }

  if (error) {
    return renderErrorState();
  }

  if (isLoading && !dashboardData) {
    return renderLoadingState();
  }

  return renderMainContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    backgroundColor: '#18181B',
    padding: 16,
    paddingTop: 60, // Safe area
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#71717A',
  },
  seedDataContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (screenWidth - 48) / 2, // 2 colunas com padding
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  stockCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 8,
  },
  chartSection: {
    marginBottom: 20,
  },
  actionsSection: {
    marginBottom: 20,
  },
  refreshButton: {
    marginHorizontal: 16,
  },
  bottomPadding: {
    height: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 150,
  },
  noShopContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noShopText: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});

export default DashboardScreen;