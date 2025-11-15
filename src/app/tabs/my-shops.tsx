import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Shop } from '../../types/auth';

export default function MyShopsScreen() {
  const { user, activeShop, getUserShops, switchShop, createShop } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingShop, setSwitchingShop] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [creatingShop, setCreatingShop] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const userShops = await getUserShops();
      setShops(userShops);
    } catch (error) {
      console.error('❌ Erro ao carregar lojas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as lojas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadShops();
    setRefreshing(false);
  }, []);

  const handleSwitchShop = async (shop: Shop) => {
    if (shop.id === activeShop?.id) {
      Alert.alert('Informação', 'Esta loja já está ativa');
      return;
    }

    Alert.alert(
      'Trocar Loja',
      `Deseja trocar para a loja "${shop.nomeDaLoja}"?\n\nOs dados da loja atual serão salvos e você verá os dados desta loja.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Trocar',
          onPress: async () => {
            setSwitchingShop(shop.id);
            try {
              const result = await switchShop(shop.id);
              if (result.success) {
                Alert.alert('Sucesso', `Agora você está na loja "${shop.nomeDaLoja}"`);
                await loadShops(); // Recarregar para atualizar o status ativo
              } else {
                Alert.alert('Erro', result.message);
              }
            } catch (error) {
              console.error('❌ Erro ao trocar loja:', error);
              Alert.alert('Erro', 'Não foi possível trocar de loja');
            } finally {
              setSwitchingShop(null);
            }
          }
        }
      ]
    );
  };

  const handleCreateShop = async () => {
    if (!newShopName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome da loja');
      return;
    }

    setCreatingShop(true);
    try {
      const result = await createShop(newShopName.trim());
      if (result.success) {
        Alert.alert('Sucesso', 'Loja criada com sucesso!');
        setModalVisible(false);
        setNewShopName('');
        await loadShops(); // Recarregar lista
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      Alert.alert('Erro', 'Não foi possível criar a loja');
    } finally {
      setCreatingShop(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Minhas Lojas" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Carregando lojas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Lojas" />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Header Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Gestão de Lojas</Text>
            <Text style={styles.infoText}>
              Você pode criar várias lojas e alternar entre elas. Cada loja terá seus próprios produtos, vendas e relatórios isolados.
            </Text>
          </View>
        </View>

        {/* Add Shop Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add-business" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Criar Nova Loja</Text>
        </TouchableOpacity>

        {/* Shops List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Suas Lojas ({shops.length})
          </Text>

          {shops.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="store" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>Nenhuma loja encontrada</Text>
              <Text style={styles.emptyText}>
                Crie sua primeira loja para começar a usar o sistema
              </Text>
            </View>
          ) : (
            <View style={styles.shopsList}>
              {shops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={[
                    styles.shopCard,
                    shop.id === activeShop?.id && styles.activeShopCard
                  ]}
                  onPress={() => handleSwitchShop(shop)}
                  disabled={switchingShop === shop.id}
                >
                  
                  {/* Shop Info */}
                  <View style={styles.shopHeader}>
                    <View style={styles.shopMainInfo}>
                      <MaterialIcons
                        name={shop.id === activeShop?.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={24}
                        color={shop.id === activeShop?.id ? '#60A5FA' : '#A1A1AA'}
                      />
                      <View style={styles.shopDetails}>
                        <Text style={[
                          styles.shopName,
                          shop.id === activeShop?.id && styles.activeShopName
                        ]}>
                          {shop.nomeDaLoja}
                        </Text>
                        <Text style={styles.shopDate}>
                          Criada em {formatDate(shop.dataCriacao.toString())}
                        </Text>
                      </View>
                    </View>

                    {/* Shop Status */}
                    <View style={styles.shopStatus}>
                      {switchingShop === shop.id ? (
                        <View style={styles.loadingBadge}>
                          <ActivityIndicator size="small" color="#60A5FA" />
                          <Text style={styles.loadingBadgeText}>Trocando...</Text>
                        </View>
                      ) : shop.id === activeShop?.id ? (
                        <View style={styles.activeBadge}>
                          <MaterialIcons name="check-circle" size={16} color="#60A5FA" />
                          <Text style={styles.activeBadgeText}>Ativa</Text>
                        </View>
                      ) : (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Trocar</Text>
                          <MaterialIcons name="arrow-forward" size={16} color="#A1A1AA" />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Active Shop Extra Info */}
                  {shop.id === activeShop?.id && (
                    <View style={styles.activeShopInfo}>
                      <Text style={styles.activeShopDescription}>
                        Esta é sua loja ativa. Todos os produtos, vendas e relatórios que você vê pertencem a esta loja.
                      </Text>
                    </View>
                  )}

                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Create Shop Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nova Loja</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da Loja"
              value={newShopName}
              onChangeText={setNewShopName}
              autoCapitalize="words"
              maxLength={100}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setNewShopName('');
                }}
                disabled={creatingShop}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCreateButton, creatingShop && styles.disabledButton]}
                onPress={handleCreateShop}
                disabled={creatingShop}
              >
                {creatingShop ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalCreateText}>Criar Loja</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A1A1AA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60A5FA',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60A5FA',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A1A1AA',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  shopsList: {
    gap: 12,
  },
  shopCard: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  activeShopCard: {
    borderColor: '#60A5FA',
    backgroundColor: '#18181B',
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopDetails: {
    marginLeft: 12,
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeShopName: {
    color: '#60A5FA',
  },
  shopDate: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  shopStatus: {
    marginLeft: 12,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1089b9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingBadgeText: {
    fontSize: 12,
    color: '#60A5FA',
    marginLeft: 4,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202b38ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#60A5FA',
    marginLeft: 4,
    fontWeight: '600',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveBadgeText: {
    fontSize: 12,
    color: '#A1A1AA',
    marginRight: 4,
  },
  activeShopInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#09090B',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#60A5FA',
  },
  activeShopDescription: {
    fontSize: 13,
    color: '#1089b9ff',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#09090B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#A1A1AA',
    fontWeight: '600',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#60A5FA',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCreateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
});