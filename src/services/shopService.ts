import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShopRepository } from '../database/authRepository';
import { Shop, CreateShopRequest, ShopResponse } from '../types/auth';

export class ShopService {
  private shopRepository: ShopRepository;

  constructor() {
    this.shopRepository = new ShopRepository();
  }

  // Criar nova loja
  async createShop(shopData: CreateShopRequest, ownerId: string): Promise<ShopResponse> {
    try {
      // Validações
      if (!shopData.nomeDaLoja || shopData.nomeDaLoja.trim().length < 2) {
        return { success: false, message: 'Nome da loja é obrigatório' };
      }

      if (!ownerId) {
        return { success: false, message: 'Proprietário não identificado' };
      }

      // Criar loja
      const newShop = await this.shopRepository.createShop({
        nomeDaLoja: shopData.nomeDaLoja.trim(),
        ownerId
      });

      // Definir como loja ativa se for a primeira loja do usuário
      const userShops = await this.shopRepository.findByOwnerId(ownerId);
      if (userShops.length === 1) {
        await this.setActiveShop(newShop.id);
      }

      return {
        success: true,
        message: 'Loja criada com sucesso!',
        shop: newShop
      };
    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Obter lojas do usuário
  async getUserShops(ownerId: string): Promise<ShopResponse> {
    try {
      if (!ownerId) {
        return { success: false, message: 'Proprietário não identificado', shops: [] };
      }

      const shops = await this.shopRepository.findByOwnerId(ownerId);

      return {
        success: true,
        message: 'Lojas carregadas com sucesso',
        shops
      };
    } catch (error) {
      console.error('❌ Erro ao buscar lojas:', error);
      return { success: false, message: 'Erro interno do servidor', shops: [] };
    }
  }

  // Trocar de loja ativa
  async switchShop(shopId: string, ownerId: string): Promise<ShopResponse> {
    try {
      if (!shopId || !ownerId) {
        return { success: false, message: 'Dados insuficientes para trocar de loja' };
      }

      // Verificar se a loja existe e pertence ao usuário
      const shop = await this.shopRepository.findById(shopId);
      if (!shop) {
        return { success: false, message: 'Loja não encontrada' };
      }

      if (shop.ownerId !== ownerId) {
        return { success: false, message: 'Você não tem permissão para acessar esta loja' };
      }

      // Definir como loja ativa
      await this.setActiveShop(shopId);

      return {
        success: true,
        message: 'Loja alterada com sucesso!',
        shop
      };
    } catch (error) {
      console.error('❌ Erro ao trocar de loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Definir loja ativa
  async setActiveShop(shopId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@auth:activeShop', shopId);
    } catch (error) {
      console.error('❌ Erro ao definir loja ativa:', error);
      throw error;
    }
  }

  // Obter loja ativa
  async getActiveShop(): Promise<Shop | null> {
    try {
      const activeShopId = await AsyncStorage.getItem('@auth:activeShop');
      if (!activeShopId) {
        return null;
      }

      const shop = await this.shopRepository.findById(activeShopId);
      return shop;
    } catch (error) {
      console.error('❌ Erro ao obter loja ativa:', error);
      return null;
    }
  }

  // Limpar loja ativa
  async clearActiveShop(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@auth:activeShop');
    } catch (error) {
      console.error('❌ Erro ao limpar loja ativa:', error);
    }
  }

  // Atualizar loja
  async updateShop(shopId: string, updates: Partial<Pick<Shop, 'nomeDaLoja'>>, ownerId: string): Promise<ShopResponse> {
    try {
      if (!shopId || !ownerId) {
        return { success: false, message: 'Dados insuficientes para atualizar loja' };
      }

      // Verificar se a loja existe e pertence ao usuário
      const shop = await this.shopRepository.findById(shopId);
      if (!shop) {
        return { success: false, message: 'Loja não encontrada' };
      }

      if (shop.ownerId !== ownerId) {
        return { success: false, message: 'Você não tem permissão para editar esta loja' };
      }

      // Validar nome se fornecido
      if (updates.nomeDaLoja && updates.nomeDaLoja.trim().length < 2) {
        return { success: false, message: 'Nome da loja deve ter pelo menos 2 caracteres' };
      }

      // Atualizar loja
      const success = await this.shopRepository.updateShop(shopId, updates);
      if (!success) {
        return { success: false, message: 'Falha ao atualizar loja' };
      }

      // Buscar loja atualizada
      const updatedShop = await this.shopRepository.findById(shopId);

      return {
        success: true,
        message: 'Loja atualizada com sucesso!',
        shop: updatedShop || undefined
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Deletar loja
  async deleteShop(shopId: string, ownerId: string): Promise<ShopResponse> {
    try {
      if (!shopId || !ownerId) {
        return { success: false, message: 'Dados insuficientes para deletar loja' };
      }

      // Verificar se a loja existe e pertence ao usuário
      const shop = await this.shopRepository.findById(shopId);
      if (!shop) {
        return { success: false, message: 'Loja não encontrada' };
      }

      if (shop.ownerId !== ownerId) {
        return { success: false, message: 'Você não tem permissão para deletar esta loja' };
      }

      // Verificar se é a única loja do usuário
      const userShops = await this.shopRepository.findByOwnerId(ownerId);
      if (userShops.length === 1) {
        return { success: false, message: 'Você não pode deletar sua única loja' };
      }

      // Verificar se é a loja ativa
      const activeShop = await this.getActiveShop();
      const isActiveShop = activeShop?.id === shopId;

      // Deletar loja
      const success = await this.shopRepository.deleteShop(shopId);
      if (!success) {
        return { success: false, message: 'Falha ao deletar loja' };
      }

      // Se era a loja ativa, definir outra como ativa
      if (isActiveShop) {
        const remainingShops = await this.shopRepository.findByOwnerId(ownerId);
        if (remainingShops.length > 0) {
          await this.setActiveShop(remainingShops[0].id);
        }
      }

      return {
        success: true,
        message: 'Loja deletada com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao deletar loja:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }
}