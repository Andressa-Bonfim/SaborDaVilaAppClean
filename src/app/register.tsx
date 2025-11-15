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
import { RegisterRequest } from '../types/auth';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterRequest>({
    nomeCompleto: '',
    email: '',
    senha: '',
    tipoDocumento: 'cpf',
    numeroDocumento: '',
    endereco: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const updateFormData = (field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showDocumentTypePicker = () => {
    Alert.alert(
      'Tipo de Documento',
      'Selecione o tipo de documento:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'CPF - Pessoa Física',
          onPress: () => {
            updateFormData('tipoDocumento', 'cpf');
            updateFormData('numeroDocumento', '');
          }
        },
        {
          text: 'CNPJ - Pessoa Jurídica', 
          onPress: () => {
            updateFormData('tipoDocumento', 'cnpj');
            updateFormData('numeroDocumento', '');
          }
        }
      ]
    );
  };

  const formatDocument = (text: string, type: 'cpf' | 'cnpj') => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formatação CPF: 000.000.000-00
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      // Formatação CNPJ: 00.000.000/0000-00
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }
  };

  const validateForm = () => {
    if (!formData.nomeCompleto.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome completo');
      return false;
    }
    
    if (formData.nomeCompleto.trim().split(' ').length < 2) {
      Alert.alert('Erro', 'Por favor, insira seu nome e sobrenome');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }
    
    if (!formData.numeroDocumento.trim()) {
      Alert.alert('Erro', `Por favor, insira seu ${formData.tipoDocumento.toUpperCase()}`);
      return false;
    }
    
    // Validação básica de CPF/CNPJ (apenas quantidade de dígitos)
    const onlyNumbers = formData.numeroDocumento.replace(/\D/g, '');
    if (formData.tipoDocumento === 'cpf' && onlyNumbers.length !== 11) {
      Alert.alert('Erro', 'CPF deve conter 11 dígitos');
      return false;
    }
    if (formData.tipoDocumento === 'cnpj' && onlyNumbers.length !== 14) {
      Alert.alert('Erro', 'CNPJ deve conter 14 dígitos');
      return false;
    }
    
    if (!formData.endereco.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu endereço');
      return false;
    }
    
    if (!formData.senha.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma senha');
      return false;
    }
    
    if (formData.senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.senha !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsRegistering(true);
    
    try {
      // Remove formatação do documento antes de enviar
      const formDataToSend = {
        ...formData,
        numeroDocumento: formData.numeroDocumento.replace(/\D/g, '')
      };
      
      const result = await register(formDataToSend);
      
      if (result.success) {
        Alert.alert(
          'Conta Criada!',
          'Sua conta foi criada com sucesso. Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login')
            }
          ]
        );
      } else {
        Alert.alert('Erro no Cadastro', result.message);
      }
    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error);
      Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginPress = () => {
    router.replace('/login');
  };

  const isFormDisabled = isLoading || isRegistering;

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
              <MaterialIcons name="person-add" size={60} color="#60A5FA" />
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
            </View>

            {/* Register Form */}
            <View style={styles.form}>
              
              {/* Nome Completo */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome Completo"
                  value={formData.nomeCompleto}
                  onChangeText={(text) => updateFormData('nomeCompleto', text)}
                  autoCapitalize="words"
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text.toLowerCase())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                />
              </View>

              {/* Tipo de Documento */}
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={showDocumentTypePicker}
                disabled={isFormDisabled}
              >
                <MaterialIcons name="assignment" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <View style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>
                    {formData.tipoDocumento === 'cpf' ? 'CPF - Pessoa Física' : 'CNPJ - Pessoa Jurídica'}
                  </Text>
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color="#A1A1AA" style={styles.dropdownIcon} />
              </TouchableOpacity>

              {/* Número do Documento */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={formData.tipoDocumento === 'cpf' ? 'CPF (000.000.000-00)' : 'CNPJ (00.000.000/0000-00)'}
                  value={formData.numeroDocumento}
                  onChangeText={(text) => {
                    const formatted = formatDocument(text, formData.tipoDocumento);
                    updateFormData('numeroDocumento', formatted);
                  }}
                  keyboardType="numeric"
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                  selectTextOnFocus={true}
                  onFocus={() => {
                    // Selecionar todo o texto quando o campo receber foco
                    if (formData.numeroDocumento) {
                      // Força a seleção completa após um pequeno delay
                      setTimeout(() => {
                        // O selectTextOnFocus já faz isso, mas garantindo
                      }, 50);
                    }
                  }}
                />
              </View>

              {/* Endereço */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="location-on" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Endereço completo"
                  value={formData.endereco}
                  onChangeText={(text) => updateFormData('endereco', text)}
                  autoCapitalize="words"
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Senha */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Senha (mín. 6 caracteres)"
                  value={formData.senha}
                  onChangeText={(text) => updateFormData('senha', text)}
                  secureTextEntry={!showPassword}
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={24}
                    color="#A1A1AA"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isFormDisabled}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={24}
                    color="#A1A1AA"
                  />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isFormDisabled && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isFormDisabled}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.registerButtonText}>Criar Conta</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta?</Text>
              <TouchableOpacity
                onPress={handleLoginPress}
                disabled={isFormDisabled}
                style={isFormDisabled && styles.disabledLink}
              >
                <Text style={[styles.loginLink, isFormDisabled && styles.disabledLinkText]}>
                  Fazer Login
                </Text>
              </TouchableOpacity>
            </View>

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
    marginBottom: 30,
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
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#09090B',
    minHeight: 50,
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
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  pickerButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  registerButton: {
    backgroundColor: '#60A5FA',
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#A1A1AA',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 16,
    color: '#60A5FA',
    fontWeight: '600',
  },
  disabledLink: {
    opacity: 0.5,
  },
  disabledLinkText: {
    color: '#71717A',
  },
});