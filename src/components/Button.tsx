import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode; // suporta ícone
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
}) => {
  // Combina os estilos do botão
  const getButtonStyle = (): ViewStyle => {
    let sizeStyle: ViewStyle;
    switch (size) {
      case 'small':
        sizeStyle = styles.small;
        break;
      case 'large':
        sizeStyle = styles.large;
        break;
      default:
        sizeStyle = styles.medium;
    }

    return {
      ...styles.button,
      ...(variant === 'primary' ? styles.primary : styles.secondary),
      ...sizeStyle,
      flexDirection: icon ? 'row' : 'column', // Se tiver ícone, organiza em linha
      alignItems: 'center',
      justifyContent: 'center',
      gap: icon ? 8 : 0,
    };
  };

  // Combina os estilos do texto
  const getTextStyle = (): TextStyle => {
    let sizeStyle: TextStyle;
    switch (size) {
      case 'small':
        sizeStyle = styles.textSmall;
        break;
      case 'large':
        sizeStyle = styles.textLarge;
        break;
      default:
        sizeStyle = styles.textMedium;
    }

    return {
      ...styles.text,
      ...sizeStyle,
    };
  };

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} activeOpacity={0.8}>
      {icon && <View>{icon}</View>}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  primary: {
    backgroundColor: '#4F46E5',
  },
  secondary: {
    backgroundColor: '#52525B',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  text: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
});
