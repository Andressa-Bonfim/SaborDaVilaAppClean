/**
 * DashboardCard Component - Cartão de KPI reutilizável
 * Implementa Clean Code e SOLID principles
 * Componente responsivo para exibir métricas
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Types para props do componente
interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'highlighted';
}

/**
 * Componente de cartão para exibir KPIs e métricas
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#FFFFFF',
  backgroundColor = 'transparent',
  onPress,
  isLoading = false,
  variant = 'default',
}) => {
  
  /**
   * Formatar valores monetários
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Formatar valores numéricos
   */
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  /**
   * Formatar valor de exibição baseado no tipo
   */
  const formatValue = (value: string | number): string => {
    if (isLoading) return '...';
    
    if (typeof value === 'number') {
      // Se o título contém palavras relacionadas a dinheiro, formatar como moeda
      if (title.toLowerCase().includes('vendas') || 
          title.toLowerCase().includes('receita') || 
          title.toLowerCase().includes('ticket') ||
          title.toLowerCase().includes('valor')) {
        return formatCurrency(value);
      }
      // Caso contrário, formatar como número
      return formatNumber(value);
    }
    
    return String(value);
  };

  /**
   * Estilos dinâmicos baseados na variante
   */
  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return styles.cardCompact;
      case 'highlighted':
        return styles.cardHighlighted;
      default:
        return styles.card;
    }
  };

  /**
   * Renderizar conteúdo do cartão
   */
  const renderCardContent = () => (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header com ícone e título */}
      <View style={styles.header}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={[styles.title, { color }]} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {/* Valor principal */}
      <Text style={[styles.value, { color }]} numberOfLines={1}>
        {formatValue(value)}
      </Text>

      {/* Subtítulo opcional */}
      {subtitle && (
        <Text style={[styles.subtitle, { color: color + '80' }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}

      {/* Indicador de loading */}
      {isLoading && (
        <View style={styles.loadingIndicator} />
      )}
    </View>
  );

  // Se tem onPress, renderizar como TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity 
        style={getCardStyles()} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderCardContent()}
      </TouchableOpacity>
    );
  }

  // Caso contrário, renderizar como View
  return (
    <View style={getCardStyles()}>
      {renderCardContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#18181B',
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
  cardCompact: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#18181B',
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
  cardHighlighted: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#18181B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  container: {
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    opacity: 0.6,
  },
});

export default DashboardCard;