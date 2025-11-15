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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu email');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, insira sua senha');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoggingIn(true);
    
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        if (result.hasShops) {
          // Usuário tem lojas, redirecionar para o app
          router.replace('/tabs');
        } else {
          // Usuário não tem lojas, redirecionar para criar primeira loja
          router.replace('/create-first-shop');
        }
      } else {
        Alert.alert('Erro no Login', result.message);
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterPress = () => {
    router.push('/register');
  };

  const isFormDisabled = isLoading || isLoggingIn;

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
              <MaterialIcons name="store" size={80} color="#60A5FA" />
              <Text style={styles.title}>Sabor da Vila</Text>
              <Text style={styles.subtitle}>Sistema de Gestão Comercial</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isFormDisabled}
                  placeholderTextColor="#71717A"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#A1A1AA" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
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

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isFormDisabled && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isFormDisabled}
              >
                {isLoggingIn ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="login" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>Entrar</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>

            {/* Register Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta?</Text>
              <TouchableOpacity
                onPress={handleRegisterPress}
                disabled={isFormDisabled}
                style={isFormDisabled && styles.disabledLink}
              >
                <Text style={[styles.registerLink, isFormDisabled && styles.disabledLinkText]}>
                  Criar Conta
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
  loginButton: {
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
  loginButtonText: {
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
  registerLink: {
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