import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {
  insertSale,
  getRecentSales,
  updateSale,
  deleteSale,
} from '../../database/salesRepository';
import { Edit, Trash2, Check } from 'lucide-react-native';

export default function Sales() {
  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [totalValue, setTotalValue] = useState<string>('');
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [editingSale, setEditingSale] = useState<any | null>(null);

  useEffect(() => {
    loadRecentSales();
    if (Platform.OS === 'web') {
      console.warn('⚠️ SQLite não é suportado no navegador.');
    } else {
      console.log(
        '📍 Caminho do banco SQLite:',
        `${FileSystem.documentDirectory}SQLite/saborDaVila.db`
      );
    }
  }, []);

  const loadRecentSales = async () => {
    const sales = await getRecentSales();
    setRecentSales(sales);
  };

  const resetForm = () => {
    setProductName('');
    setQuantity('');
    setTotalValue('');
    setEditingSale(null);
  };

  const handleConfirmSale = async () => {
    const prod = productName?.trim() || '';
    const qty = quantity?.trim() || '';
    const total = totalValue?.trim() || '';

    if (!prod || !qty || !total) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const qtyNum = Number(qty);
    const totalNum = Number(total);

    if (isNaN(qtyNum) || isNaN(totalNum)) {
      Alert.alert('Erro', 'Quantidade e Valor devem ser números válidos');
      return;
    }

    try {
      if (editingSale) {
        await updateSale(editingSale.id, prod, qtyNum, totalNum);
        Alert.alert('Sucesso', 'Venda atualizada com sucesso!');
      } else {
        await insertSale(prod, qtyNum, totalNum);
        Alert.alert('Venda registrada!', `${prod} - ${qtyNum} un - R$ ${totalNum}`);
      }

      resetForm();
      await loadRecentSales(); // espera a lista atualizar
    } catch (error) {
      console.error('❌ Erro ao salvar venda:', error);
      Alert.alert('Erro', 'Não foi possível salvar a venda.');
    }
  };

  const handleDeleteSale = (id: number) => {
    Alert.alert('Excluir Venda', 'Deseja realmente excluir esta venda?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteSale(id);
          loadRecentSales();
          Alert.alert('Removida', 'Venda excluída com sucesso.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent style="light" />
      <Header title="Registrar Venda" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.headerTitleContainer}>
            {editingSale ? (
              <Edit color="#60A5FA" size={20} />
            ) : (
              <Check color="#10B981" size={20} />
            )}
            <Text style={styles.headerTitle}>
              {editingSale ? ' Editar Venda' : ' Nova Venda'}
            </Text>
          </View>

          <Input
            label="Nome do Produto"
            placeholder="Ex: X-Burger Completo"
            value={productName}
            onChangeText={(text) => setProductName(text || '')}
          />

          <Input
            label="Quantidade"
            placeholder="Ex: 2"
            value={quantity}
            onChangeText={(text) => setQuantity(text || '')}
            keyboardType="numeric"
          />

          <Input
            label="Valor Total (R$)"
            placeholder="Ex: 25,50"
            value={totalValue}
            onChangeText={(text) => setTotalValue(text || '')}
            keyboardType="numeric"
          />

          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                title={editingSale ? 'Atualizar' : 'Confirmar Venda'}
                onPress={handleConfirmSale}
              />
            </View>
            {editingSale && (
              <View style={styles.buttonContainer}>
                <Button title="Cancelar" variant="secondary" onPress={resetForm} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.recentSalesContainer}>
          <Text style={styles.recentSalesTitle}>Vendas Recentes</Text>

          {recentSales.length === 0 ? (
            <Text style={{ color: '#A1A1AA' }}>Nenhuma venda registrada.</Text>
          ) : (
            recentSales.map((sale, index) => (
              <View
                key={index}
                style={[
                  styles.saleItem,
                  index === recentSales.length - 1 && styles.lastSaleItem,
                ]}
              >
                <View>
                  <Text style={styles.productName}>{sale.product}</Text>
                  <Text style={styles.productQuantity}>
                    {sale.itemsSold} un — R$ {Number(sale.total).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingSale(sale);
                      setProductName(sale.product || '');
                      setQuantity(String(sale.itemsSold || ''));
                      setTotalValue(String(sale.total || ''));
                    }}
                  >
                    <Edit color="#60A5FA" size={20} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDeleteSale(sale.id)}>
                    <Trash2 color="#F87171" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', paddingTop:20 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingVertical: 24 },
  formContainer: {
    backgroundColor: '#18181B',
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  buttonContainer: { flex: 1 },
  recentSalesContainer: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  recentSalesTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  lastSaleItem: { borderBottomWidth: 0 },
  productName: { color: '#FFFFFF', fontWeight: '500' },
  productQuantity: { color: '#A1A1AA', fontSize: 14 },
  actionButtons: { flexDirection: 'row', gap: 12 },
});
