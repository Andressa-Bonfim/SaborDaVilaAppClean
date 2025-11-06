import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CardProps {
  title: string;
  value: string;
}

export const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>
      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    flex: 1,
    marginHorizontal: 4,
  },
  title: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});