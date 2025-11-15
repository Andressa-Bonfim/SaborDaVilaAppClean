// Entidades do sistema de autenticação

export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  tipoDocumento: 'cpf' | 'cnpj';
  numeroDocumento: string;
  endereco: string;
  userRole: 'user' | 'admin';
  senhaHash: string;
  dataCriacao: Date;
}

export interface Shop {
  id: string;
  ownerId: string;
  nomeDaLoja: string;
  dataCriacao: Date;
}

export interface AuthUser {
  id: string;
  nomeCompleto: string;
  email: string;
  tipoDocumento: 'cpf' | 'cnpj';
  numeroDocumento: string;
  endereco: string;
  userRole: 'user' | 'admin';
  dataCriacao: Date;
}

export interface RegisterRequest {
  nomeCompleto: string;
  email: string;
  senha: string;
  tipoDocumento: 'cpf' | 'cnpj';
  numeroDocumento: string;
  endereco: string;
  userRole?: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CreateShopRequest {
  nomeDaLoja: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  hasShops?: boolean;
}

export interface ShopResponse {
  success: boolean;
  message: string;
  shop?: Shop;
  shops?: Shop[];
}