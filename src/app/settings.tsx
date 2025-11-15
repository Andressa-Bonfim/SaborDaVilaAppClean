import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Shop } from '../types/auth';
import { seedDatabase, clearSampleData } from '../database/seedData';

export default function Settings() {
  const { user, activeShop, getUserShops, switchShop, createShop, logout } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchShop = async (shopId: string) => {
    try {
      const result = await switchShop(shopId);
      if (result.success) {
        Alert.alert('Sucesso', 'Loja alterada com sucesso!');
        await loadShops(); // Recarregar lista
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('❌ Erro ao trocar loja:', error);
      Alert.alert('Erro', 'Não foi possível trocar de loja');
    }
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

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleSeedData = async () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa selecionada');
      return;
    }

    Alert.alert(
      'Dados de Exemplo',
      'Deseja adicionar dados de exemplo para demonstração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async () => {
            try {
              await seedDatabase(activeShop.id);
              Alert.alert('Sucesso', 'Dados de exemplo adicionados com sucesso!');
            } catch (error) {
              console.error('Erro ao popular dados:', error);
              Alert.alert('Erro', 'Não foi possível adicionar dados de exemplo');
            }
          }
        }
      ]
    );
  };

  const handleClearData = async () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa selecionada');
      return;
    }

    Alert.alert(
      'Limpar Dados',
      'Deseja remover todos os dados de exemplo? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSampleData(activeShop.id);
              Alert.alert('Sucesso', 'Dados removidos com sucesso!');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível remover os dados');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Configurações" />
      
      <ScrollView style={styles.content}>
        
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Conta</Text>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <MaterialIcons name="person" size={24} color="#10B981" />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.nomeCompleto}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userDocument}>
                  {user?.tipoDocumento?.toUpperCase()}: {user?.numeroDocumento}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shops Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minhas Lojas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Nova Loja</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingText}>Carregando lojas...</Text>
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
                  onPress={() => handleSwitchShop(shop.id)}
                >
                  <View style={styles.shopInfo}>
                    <MaterialIcons
                      name={shop.id === activeShop?.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={20}
                      color={shop.id === activeShop?.id ? '#10B981' : '#A1A1AA'}
                    />
                    <Text style={[
                      styles.shopName,
                      shop.id === activeShop?.id && styles.activeShopName
                    ]}>
                      {shop.nomeDaLoja}
                    </Text>
                  </View>
                  {shop.id === activeShop?.id && (
                    <Text style={styles.activeLabel}>Ativa</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          {activeShop && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleSeedData}>
                <MaterialIcons name="dataset" size={20} color="#10B981" />
                <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
                  Adicionar Dados de Exemplo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleClearData}>
                <MaterialIcons name="clear-all" size={20} color="#F59E0B" />
                <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>
                  Limpar Dados de Exemplo
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.actionButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
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
                  <Text style={styles.modalCreateText}>Criar</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 2,
  },
  userDocument: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#A1A1AA',
  },
  shopsList: {
    gap: 8,
  },
  shopCard: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeShopCard: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeShopName: {
    color: '#10B981',
    fontWeight: '600',
  },
  activeLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
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
    width: '80%',
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
    backgroundColor: '#10B981',
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
