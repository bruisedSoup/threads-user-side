import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useUserStore from '../stores/userStore';

const EditFieldModal = ({ visible, field, label, currentValue, userId, onClose, onSave }) => {
  const [value, setValue] = useState(currentValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { refreshUser, updateUserField } = useUserStore(); // Add this

  const API_URL = 'http://10.0.2.2:3000/api/users';

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Error', 'This field cannot be empty');
      return;
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    if (field === 'phone_number') {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updateData = { [field]: value };
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update');
      }

      updateUserField(field, value);
      
      await Promise.all([
        queryClient.invalidateQueries(['user', userId]),
        refreshUser()
      ]);
      
      Alert.alert('Success', `${label} updated successfully`);
      onSave(value); 
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputProps = () => {
    switch (field) {
      case 'email':
        return {
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoCorrect: false,
        };
      case 'phone_number':
        return {
          keyboardType: 'phone-pad',
          placeholder: '+1 (555) 123-4567',
        };
      case 'first_name':
      case 'last_name':
        return {
          autoCapitalize: 'words',
        };
      default:
        return {
          autoCapitalize: 'none',
          autoCorrect: false,
        };
    }
  };

  React.useEffect(() => {
    if (visible) {
      setValue(currentValue || '');
    }
  }, [visible, currentValue]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit {label}</Text>
            <Text style={styles.modalSubtitle}>Update your {label.toLowerCase()}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={`Enter your ${label.toLowerCase()}`}
              autoFocus={true}
              {...getInputProps()}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7c7cc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditFieldModal;