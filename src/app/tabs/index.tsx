import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { initializeDatabase } from '../../database/database';
import { getDailySales, getWeeklySummary, initializeSalesTable } from '../../database/salesRepository';
import { SalesSummary } from '../../types/sales';
import { BarChart, Plus, Check } from 'lucide-react-native';
import { NETSIM_HOST, NETSIM_PORT } from '../../config/netsim';


export default function Index() {
  const [dailySales, setDailySales] = useState('R$ 0,00');
  const [itemsSold, setItemsSold] = useState('0 itens');
  const [weeklySummary, setWeeklySummary] = useState<SalesSummary>({
    total: 0,
    items: 0,
    avgTicket: 0,
  });

  useEffect(() => {
  // const testNetsim = async () => {
  //   const url = `http://${NETSIM_HOST}:${NETSIM_PORT}/ping`;
  //   try {
  //     const controller = new AbortController();
  //     const id = setTimeout(() => controller.abort(), 5000);
  //     await fetch(url, { signal: controller.signal });
  //     console.log('✅ Conectado ao Netsim!');
  //     clearTimeout(id);
  //   } catch (err) {
  //     console.warn('⚠️ Erro de conexão com Netsim (não bloqueante)', err);
  //   }
  // };
  // testNetsim();
}, []);


  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const daily = await getDailySales();
    const weekly = await getWeeklySummary();

    setDailySales(`R$ ${(daily.total || 0).toFixed(2)}`);
    setItemsSold(`${daily.items || 0} itens`);
    setWeeklySummary({
      total: weekly.total || 0,
      items: weekly.items || 0,
      avgTicket: weekly.avgTicket || 0,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      await initializeSalesTable();
      await initializeDatabase();
      await loadData();
    };

    init();
  }, []);

  const handleNewSale = () => router.push('/sales');
  const handleAddProduct = () => router.push('/inventory');

  return (
    <View style={styles.container}>
      <StatusBar translucent style="light" />
      <Header title="Dashboard" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Cards de resumo */}
        <View style={styles.cardsContainer}>
          <Card title="Vendas do Dia" value={dailySales} />
          <Card title="Itens Vendidos" value={itemsSold} />
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.buttonsContainer}>
            <Button
              title="Nova Venda"
              onPress={handleNewSale}
              size="large"
              icon={<Check color="#10B981" size={20} />}
            />
            <Button
              title="Adicionar Produto"
              onPress={handleAddProduct}
              variant="secondary"
              size="large"
              icon={<Plus color="#3B82F6" size={20} />}
            />
          </View>
        </View>

        {/* Estatísticas Semanais */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <BarChart color="#FFFFFF" size={20} />
            <Text style={styles.statsTitle}>Resumo da Semana</Text>
          </View>
          <View style={styles.statsContent}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total de Vendas:</Text>
              <Text style={styles.statValue}>R$ {weeklySummary.total.toFixed(2)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Produtos Vendidos:</Text>
              <Text style={styles.statValue}>{weeklySummary.items} itens</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ticket Médio:</Text>
              <Text style={styles.statValue}>R$ {weeklySummary.avgTicket.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingTop: 20 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingVertical: 24 },
  cardsContainer: { flexDirection: 'row', marginBottom: 24, gap: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  buttonsContainer: { gap: 12 },
  statsContainer: { backgroundColor: '#18181B', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#27272A' },
  statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statsTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 },
  statsContent: { gap: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#A1A1AA' },
  statValue: { color: '#FFFFFF', fontWeight: '600' },
});
