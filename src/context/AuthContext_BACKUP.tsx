import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { AuthUser, Shop } from '../types/auth';
import { AuthService } from '../services/authService';
import { ShopService } from '../services/shopService';
import { initializeAuthTables } from '../database/authRepository';

// Interface para callbacks de mudança de loja
interface ShopChangeCallbacks {
  onShopChanged?: (shopId: string) => Promise<void> | void;
}

interface AuthContextType {
  // Estado
  user: AuthUser | null;
  activeShop: Shop | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Ações
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; hasShops?: boolean }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  
  // Gestão de lojas
  createShop: (shopName: string) => Promise<{ success: boolean; message: string; shop?: Shop }>;
  switchShop: (shopId: string) => Promise<{ success: boolean; message: string }>;
  getUserShops: () => Promise<Shop[]>;
  refreshAuth: () => Promise<void>;
  
  // Sistema de callbacks para mudança de loja
  registerShopChangeCallback: (callback: () => Promise<void> | void) => () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lista de callbacks para notificar mudanças de loja - usando useRef para evitar re-renders
  const shopChangeCallbacks = useRef<Array<() => Promise<void> | void>>([]);
  
  const authService = new AuthService();
  const shopService = new ShopService();

  const isAuthenticated = user !== null;
  const isAdmin = user?.userRole === 'admin';

  // Registrar callback para mudança de loja - memoizado para evitar re-renders
  const registerShopChangeCallback = useCallback((callback: () => Promise<void> | void) => {
    shopChangeCallbacks.current.push(callback);
    
    // Retornar função para remover o callback
    return () => {
      shopChangeCallbacks.current = shopChangeCallbacks.current.filter(cb => cb !== callback);
    };
  }, []);

  // Notificar todos os callbacks de mudança de loja - memoizado
  const notifyShopChange = useCallback(async () => {
    console.log(`🔄 Notificando ${shopChangeCallbacks.current.length} callbacks de mudança de loja`);
    
    for (const callback of shopChangeCallbacks.current) {
      try {
        await callback();
      } catch (error) {
        console.error('❌ Erro ao executar callback de mudança de loja:', error);
      }
    }
  }, []);

  // Inicializar autenticação ao carregar o app
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar tabelas de autenticação
      await initializeAuthTables();
      
      // Verificar se há usuário logado
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Verificar se há loja ativa
        const currentActiveShop = await shopService.getActiveShop();
        if (currentActiveShop) {
          setActiveShop(currentActiveShop);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login({ email, senha: password });
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Se usuário tem lojas, carregar a loja ativa
        if (result.hasShops) {
          const currentActiveShop = await shopService.getActiveShop();
          if (currentActiveShop) {
            setActiveShop(currentActiveShop);
          }
        }
      }
      
      return {
        success: result.success,
        message: result.message,
        hasShops: result.hasShops
      };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await shopService.clearActiveShop();
      setUser(null);
      setActiveShop(null);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createShop = async (shopName: string) => {
    try {
      if (!user) {
        return { success: false, message: 'Usuário não autenticado' };
      }
      
      setIsLoading(true);
      const result = await shopService.createShop({ nomeDaLoja: shopName }, user.id);
      
      if (result.success && result.shop) {
        setActiveShop(result.shop);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const switchShop = async (shopId: string) => {
    try {
      if (!user) {
        return { success: false, message: 'Usuário não autenticado' };
      }
      
      console.log(`🔄 Iniciando troca para a loja: ${shopId}`);
      setIsLoading(true);
      
      // Primeiro, fazer a troca no backend
      const result = await shopService.switchShop(shopId, user.id);
      
      if (result.success && result.shop) {
        console.log(`✅ Troca realizada no backend: ${result.shop.nomeDaLoja}`);
        
        // Definir nova loja ativa
        setActiveShop(result.shop);
        
        console.log('🧹 Iniciando limpeza de dados e recarregamento...');
        
        // Notificar todos os componentes que precisam recarregar dados
        await notifyShopChange();
        
        console.log(`🎉 Troca para a loja '${result.shop.nomeDaLoja}' concluída com sucesso`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao trocar de loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserShops = async (): Promise<Shop[]> => {
    try {
      if (!user) {
        return [];
      }
      
      const result = await shopService.getUserShops(user.id);
      return result.shops || [];
    } catch (error) {
      console.error('❌ Erro ao buscar lojas:', error);
      return [];
    }
  };

  const refreshAuth = async () => {
    await initializeAuth();
  };

  const value: AuthContextType = {
    // Estado
    user,
    activeShop,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.userRole === 'admin',
    
    // Ações
    login,
    register,
    logout,
    
    // Gestão de lojas
    createShop,
    switchShop,
    getUserShops,
    refreshAuth,
    
    // Sistema de callbacks
    registerShopChangeCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};