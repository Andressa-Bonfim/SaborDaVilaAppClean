import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CreateFirstShopScreen() {
  const [shopName, setShopName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createShop, isLoading } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!shopName.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome da loja');
      return false;
    }
    
    if (shopName.trim().length < 2) {
      Alert.alert('Erro', 'O nome da loja deve ter pelo menos 2 caracteres');
      return false;
    }
    
    return true;
  };

  const handleCreateShop = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      const result = await createShop(shopName.trim());
      
      if (result.success) {
        Alert.alert(
          'Loja Criada!',
          'Sua loja foi criada com sucesso. Você pode começar a usar o sistema.',
          [
            {
              text: 'Começar',
              onPress: () => router.replace('/tabs')
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao criar loja:', error);
      Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair? Você precisará fazer login novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            router.replace('/login');
          }
        }
      ]
    );
  };

  const isFormDisabled = isLoading || isCreating;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.header}>
              <MaterialIcons name="store" size={80} color="#10B981" />
              <Text style={styles.title}>Primeira Loja</Text>
              <Text style={styles.subtitle}>
                Vamos criar sua primeira loja para começar a usar o sistema
              </Text>
            </View>

            {/* Create Shop Form */}
            <View style={styles.form}>
              
              {/* Informational Card */}
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={24} color="#10B981" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Sobre as Lojas</Text>
                  <Text style={styles.infoText}>
                    Você pode criar várias lojas e alternar entre elas. Cada loja terá seus próprios produtos, vendas e relatórios.
                  </Text>
                </View>
              </View>

              {/* Shop Name Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="store" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome da Loja"
                  value={shopName}
                  onChangeText={setShopName}
                  autoCapitalize="words"
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                  maxLength={100}
                />
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.createButton, isFormDisabled && styles.disabledButton]}
                onPress={handleCreateShop}
                disabled={isFormDisabled}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="add-business" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.createButtonText}>Criar Loja</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Examples */}
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Exemplos de nomes:</Text>
                <View style={styles.examplesList}>
                  <Text style={styles.exampleItem}>• Mercadinho da Vila</Text>
                  <Text style={styles.exampleItem}>• Loja Central</Text>
                  <Text style={styles.exampleItem}>• Comércio São João</Text>
                  <Text style={styles.exampleItem}>• Padaria do Bairro</Text>
                </View>
              </View>

            </View>

            {/* Logout Option */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isFormDisabled}
            >
              <MaterialIcons name="logout" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#064E3B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#10B981',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#09090B',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  examplesContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#09090B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  examplesList: {
    paddingLeft: 8,
  },
  exampleItem: {
    fontSize: 14,
    color: '#71717A',
    marginBottom: 4,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 6,
    fontWeight: '500',
  },
});