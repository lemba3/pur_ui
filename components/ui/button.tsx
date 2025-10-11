import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  disabled = false,
  isLoading = false,
  style,
  textStyle,
  color,
}) => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];
  const isBusy = disabled || isLoading;

  const textColor = colorScheme === 'dark' ? Colors.light.text : Colors.dark.text;
  const activityIndicatorColor = colorScheme === 'dark' ? Colors.light.text : Colors.dark.text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color ?? currentColors.tint, opacity: isBusy ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={isBusy}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={activityIndicatorColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Button;
