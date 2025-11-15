import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';

import { initializeDatabase } from '../../database/database';
import { getProductRepository } from '../../database/productRepository';
import { Edit, Trash2, Plus } from 'lucide-react-native';


export default function Inventory() {
  const { activeShop } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Função para carregar produtos
  const loadProducts = async () => {
    if (!activeShop?.id) {
      console.warn('⚠️ Estoque: Nenhuma loja ativa para carregar produtos');
      setProducts([]);
      return;
    }

    if (Platform.OS === 'web') {
      console.warn('⚠️ SQLite não é suportado no navegador.');
      setProducts([]);
      return;
    }

    try {
      console.log(`📦 Estoque: Carregando produtos da loja ${activeShop.id}`);
      const productRepo = await getProductRepository();
      const shopProducts = await productRepo.getAll(activeShop.id);
      setProducts(shopProducts);
      console.log(`✅ Estoque: ${shopProducts.length} produtos carregados`);
    } catch (error) {
      console.error('❌ Estoque: Erro ao carregar produtos:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        await loadProducts();
      } catch (error) {
        console.error('❌ Estoque: Erro ao inicializar:', error);
      }
    };
    init();
  }, [activeShop?.id]);

  const handleSaveProduct = async () => {
    if (!newProductName.trim() || !newProductQuantity.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa selecionada.');
      return;
    }

    const productData = {
      name: newProductName.trim(),
      quantity: parseInt(newProductQuantity),
      minQuantity: 5,
      shopId: activeShop.id,
      stock: parseInt(newProductQuantity),
      price: 0, // Valor padrão, pode ser editado depois
    };

    if (Platform.OS === 'web') {
      Alert.alert('Modo Web', 'SQLite não disponível no navegador.');
      return;
    }

    try {
      console.log(`💾 Estoque: Salvando produto na loja ${activeShop.id}`);
      const productRepo = await getProductRepository();
      
      if (editingProduct) {
        await productRepo.update(editingProduct.id, productData);
        Alert.alert('Sucesso', 'Produto atualizado!');
        console.log('✅ Estoque: Produto atualizado com sucesso');
      } else {
        await productRepo.insert(productData);
        Alert.alert('Sucesso', 'Produto adicionado!');
        console.log('✅ Estoque: Produto adicionado com sucesso');
      }

      await loadProducts(); // Recarregar lista
      resetForm();
    } catch (error) {
      console.error('❌ Estoque: Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Falha ao salvar produto. Tente novamente.');
    }
  };

  const handleDeleteProduct = (id: number) => {
    Alert.alert('Excluir Produto', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!activeShop?.id) {
            console.warn('⚠️ Estoque: Nenhuma loja ativa para deletar produto');
            return;
          }

          try {
            console.log(`🗑️ Estoque: Deletando produto ${id} da loja ${activeShop.id}`);
            const productRepo = await getProductRepository();
            await productRepo.delete(id);
            await loadProducts(); // Recarregar lista
            Alert.alert('Removido', 'Produto excluído com sucesso.');
            console.log('✅ Estoque: Produto deletado com sucesso');
          } catch (error) {
            console.error('❌ Estoque: Erro ao excluir produto:', error);
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setNewProductName('');
    setNewProductQuantity('');
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const renderProduct = (item: any) => (
    <View key={item.id} style={styles.productCard}>
      <View style={styles.productContent}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.minQuantity}>Mínimo: {item.minQuantity}</Text>
        </View>
        <View style={styles.quantityInfo}>
          <Text
            style={[
              styles.quantityText,
              item.quantity <= item.minQuantity && { color: '#F87171' },
            ]}
          >
            Qtd: {item.quantity}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => {
                setEditingProduct(item);
                setNewProductName(item.name);
                setNewProductQuantity(String(item.quantity));
                setShowAddForm(true);
              }}
            >
              <Edit color="#60A5FA" size={20} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
              <Trash2 color="#F87171" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent style="light" />
      <Header title="Controle de Estoque" />

      {/* ScrollView para permitir rolagem total */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowAddForm(true);
            }}
            activeOpacity={0.8}
          >
            <Plus color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Novo Produto</Text>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </Text>

            <Input
              label="Nome do Produto"
              placeholder="Ex: Batata Frita"
              value={newProductName}
              onChangeText={setNewProductName}
            />

            <Input
              label="Quantidade"
              placeholder="Ex: 50"
              value={newProductQuantity}
              onChangeText={setNewProductQuantity}
              keyboardType="numeric"
            />

            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <Button
                  title={editingProduct ? 'Atualizar' : 'Adicionar'}
                  onPress={handleSaveProduct}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Cancelar" onPress={resetForm} variant="secondary" />
              </View>
            </View>
          </View>
        )}

        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>
            Produtos em Estoque ({products.length})
          </Text>

          {products.map(renderProduct)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B',paddingTop:20 },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 24 },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600' },
  formContainer: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  formTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  buttonContainer: { flex: 1 },
  productsSection: { flex: 1 },
  productsTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  productCard: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 12,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: { flex: 1 },
  productName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  minQuantity: { color: '#A1A1AA', fontSize: 14 },
  quantityInfo: { alignItems: 'flex-end' },
  quantityText: { color: '#10B981', fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editText: { color: '#60A5FA', fontSize: 16 },
  deleteText: { color: '#F87171', fontSize: 16 },
});
