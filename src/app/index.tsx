import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Redirecionar baseado no estado de autenticação
  if (isAuthenticated) {
    return <Redirect href="/tabs" />;
  } else {
    return <Redirect href="/login" />;
  }
}
