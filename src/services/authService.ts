import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRepository, ShopRepository } from '../database/authRepository';
import { User, AuthUser, RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

export class AuthService {
  private userRepository: UserRepository;
  private shopRepository: ShopRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.shopRepository = new ShopRepository();
  }

  // Validações
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidCPF(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  }

  private isValidCNPJ(cnpj: string): boolean {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return cleanCnpj.length === 14;
  }

  private async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Registrar novo usuário
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validações
      if (!userData.nomeCompleto || userData.nomeCompleto.trim().length < 2) {
        return { success: false, message: 'Nome completo é obrigatório' };
      }

      if (!this.isValidEmail(userData.email)) {
        return { success: false, message: 'Email inválido' };
      }

      if (!userData.senha || userData.senha.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Validar documento
      const documentoLimpo = userData.numeroDocumento.replace(/\D/g, '');
      if (userData.tipoDocumento === 'cpf') {
        if (!this.isValidCPF(documentoLimpo)) {
          return { success: false, message: 'CPF inválido' };
        }
      } else {
        if (!this.isValidCNPJ(documentoLimpo)) {
          return { success: false, message: 'CNPJ inválido' };
        }
      }

      // Verificar se email já existe
      const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        return { success: false, message: 'Este email já está em uso' };
      }

      // Verificar se documento já existe
      const existingUserByDoc = await this.userRepository.findByDocument(
        userData.tipoDocumento,
        documentoLimpo
      );
      if (existingUserByDoc) {
        const docType = userData.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ';
        return { success: false, message: `Este ${docType} já está em uso` };
      }

      // Criar hash da senha
      const senhaHash = await this.hashPassword(userData.senha);

      // Criar usuário
      const newUser = await this.userRepository.createUser({
        nomeCompleto: userData.nomeCompleto.trim(),
        email: userData.email.toLowerCase().trim(),
        tipoDocumento: userData.tipoDocumento,
        numeroDocumento: documentoLimpo,
        endereco: userData.endereco.trim(),
        userRole: userData.userRole || 'user',
        senhaHash
      });

      return {
        success: true,
        message: 'Usuário criado com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Login do usuário
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!loginData.email || !loginData.senha) {
        return { success: false, message: 'Email e senha são obrigatórios' };
      }

      // Buscar usuário por email
      const user = await this.userRepository.findByEmail(loginData.email.toLowerCase().trim());
      if (!user) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Verificar senha
      const isPasswordValid = await this.verifyPassword(loginData.senha, user.senhaHash);
      if (!isPasswordValid) {
        return { success: false, message: 'Email ou senha incorretos' };
      }

      // Criar objeto AuthUser (sem senha)
      const authUser: AuthUser = {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        endereco: user.endereco,
        userRole: user.userRole,
        dataCriacao: user.dataCriacao
      };

      // Salvar sessão
      await AsyncStorage.setItem('@auth:user', JSON.stringify(authUser));

      // Verificar se usuário tem lojas
      const userShops = await this.shopRepository.findByOwnerId(user.id);
      const hasShops = userShops.length > 0;

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: authUser,
        hasShops
      };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Obter usuário atual da sessão
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem('@auth:user');
      if (userData) {
        const user = JSON.parse(userData);
        // Converter string de data para Date
        user.dataCriacao = new Date(user.dataCriacao);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['@auth:user', '@auth:activeShop']);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  }

  // Verificar se usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      return false;
    }
  }
}