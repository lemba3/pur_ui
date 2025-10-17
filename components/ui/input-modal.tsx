import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import Button from './button';
import { Colors } from '@/constants/theme';

interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: { amount: string }) => void;
  title: string;
  inputLabel?: string;
  submitButtonText?: string;
  isLoading?: boolean;
}

export default function InputModal({
  visible,
  onClose,
  onSubmit,
  title,
  inputLabel,
  submitButtonText = 'Submit',
  isLoading = false,
}: InputModalProps) {
  const [inputValue, setInputValue] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setInputValue('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (inputValue && !isLoading) {
      onSubmit({ amount: inputValue });
      setInputValue('');
    }
  };

  return (
    <Modal
      animationType="fade" // Changed to fade for a smoother transition
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <ThemedView style={styles.modalView}>
          <ThemedText type="subtitle" style={{ color: Colors.dark.cardText, fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>{title}</ThemedText>
          {inputLabel && <ThemedText style={styles.inputLabel}>{inputLabel}</ThemedText>}
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={setInputValue}
            value={inputValue}
            placeholder="e.g., 100.00"
            placeholderTextColor={Colors.dark.icon}
            editable={!isLoading}
          />
          {isLoading && <ActivityIndicator size="large" color={Colors.dark.tint} style={styles.activityIndicator} />}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              color={Colors.dark.icon} // Neutral color for cancel
              disabled={isLoading}
              style={{ flex: 1, backgroundColor: Colors.dark.error, borderWidth: 1, borderColor: Colors.dark.icon }}
              textStyle={{ color: Colors.dark.text }}
            />
            <Button
              title={submitButtonText}
              onPress={handleSubmit}
              color={Colors.dark.tint} // Themed color for submit
              disabled={isLoading || !inputValue}
              textStyle={{ color: Colors.dark.text }}
              style={{ flex: 1, backgroundColor: Colors.dark.tint }}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
  },
  modalView: {
    margin: 20,
    borderRadius: 15, // Slightly smaller border radius for modal
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5, // More pronounced shadow
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    width: '85%',
    backgroundColor: Colors.dark.cardBackground,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
    color: Colors.dark.cardText,
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    borderColor: Colors.dark.icon,
    color: Colors.dark.cardText,
    backgroundColor: Colors.dark.inputBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between
    width: '100%',
    gap: 10, // Use gap for spacing
    marginTop: 10,
  },
  activityIndicator: {
    marginBottom: 15,
  },
});