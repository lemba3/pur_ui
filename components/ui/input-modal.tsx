import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import Button from './button';

interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
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

  const handleSubmit = () => {
    if (inputValue && !isLoading) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <ThemedView style={styles.modalView}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {inputLabel && <ThemedText style={styles.inputLabel}>{inputLabel}</ThemedText>}
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={setInputValue}
            value={inputValue}
            placeholder="e.g., 100.00"
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />}
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} color="#888" disabled={isLoading} style={{ flex: 1 }} />
            <Button title={submitButtonText} onPress={handleSubmit} disabled={isLoading} style={{ flex: 1 }} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 16,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    color: '#000', // Assuming light theme for input text
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 10,
  },
  activityIndicator: {
    marginBottom: 15,
  },
});
