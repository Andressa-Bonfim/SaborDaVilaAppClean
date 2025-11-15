/**
 * useDashboard Hook - Gerenciamento de estado para o dashboard
 * Implementa Clean Code e SOLID principles
 * Hook customizado para métricas e KPIs
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllDashboardMetrics, DashboardMetrics } from '../services/dashboardService';

// Types para estados do hook
interface DashboardState {
  data: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseDashboardReturn extends DashboardState {
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook customizado para gerenciar dados do dashboard
 * @param shopId ID da loja para filtrar os dados (string)
 * @param autoRefresh Se deve atualizar automaticamente (padrão: false)
 * @param refreshInterval Intervalo de atualização automática em ms (padrão: 60000)
 */
export const useDashboard = (
  shopId: string | undefined,
  autoRefresh: boolean = false,
  refreshInterval: number = 60000 // 1 minuto
): UseDashboardReturn => {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  /**
   * Função para buscar os dados do dashboard
   */
  const fetchDashboardData = useCallback(async () => {
    if (!shopId) {
      console.log('🔍 useDashboard: shopId não definido, aguardando...');
      return;
    }

    console.log(`📊 useDashboard: Iniciando carregamento das métricas - Loja ${shopId}`);
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const dashboardData = await getAllDashboardMetrics(shopId);
      
      setState(prev => ({
        ...prev,
        data: dashboardData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      }));
      
      console.log(`✅ useDashboard: Métricas carregadas com sucesso - Loja ${shopId}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error(`❌ useDashboard: Erro ao carregar métricas - Loja ${shopId}:`, errorMessage);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Erro ao carregar dados: ${errorMessage}`,
        lastUpdated: null,
      }));
    }
  }, [shopId]);

  /**
   * Função para recarregar os dados manualmente
   */
  const refetch = useCallback(async () => {
    console.log('🔄 useDashboard: Refetch manual solicitado');
    await fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Função para refresh (alias para refetch)
   */
  const refresh = useCallback(async () => {
    console.log('🔄 useDashboard: Refresh manual solicitado');
    await fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Effect para carregar dados iniciais quando shopId muda
   */
  useEffect(() => {
    if (shopId) {
      console.log(`🏪 useDashboard: shopId alterado para ${shopId}, carregando dados...`);
      fetchDashboardData();
    } else {
      // Limpar dados quando não há loja selecionada
      setState({
        data: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
      });
    }
  }, [shopId, fetchDashboardData]);

  /**
   * Effect para atualização automática
   */
  useEffect(() => {
    if (!autoRefresh || !shopId) {
      return;
    }

    console.log(`⏰ useDashboard: Configurando auto-refresh a cada ${refreshInterval}ms`);
    
    const interval = setInterval(() => {
      console.log('⏰ useDashboard: Auto-refresh executado');
      fetchDashboardData();
    }, refreshInterval);

    return () => {
      console.log('⏰ useDashboard: Limpando interval de auto-refresh');
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, shopId, fetchDashboardData]);

  /**
   * Effect de debug para monitorar mudanças de estado
   */
  useEffect(() => {
    console.log('🔍 useDashboard: Estado atualizado:', {
      hasData: !!state.data,
      isLoading: state.isLoading,
      hasError: !!state.error,
      lastUpdated: state.lastUpdated?.toLocaleTimeString(),
    });
  }, [state]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refetch,
    refresh,
  };
};

export default useDashboard;