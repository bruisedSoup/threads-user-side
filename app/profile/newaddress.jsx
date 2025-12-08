import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BackIcon from './backicon.jsx'; 
import useUserStore from '../stores/userStore.js';

const apiUrl = process.env.EXPO_API_USERS_URL || 'http://10.0.2.2:3000/api/users';

const createAddress = async (userId, addressData) => {
  if (!userId) {
    throw new Error('User ID is required to create an address');
  }
  
  const url = `${apiUrl}/${userId}/addresses`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create address (Status: ${response.status})`);
    }
    return response.json();
  } catch (error) {
    console.error('Address creation error:', { url, userId, error: error.message });
    throw error;
  }
};

const EditPrimaryAddress = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [address_type, setAddressType] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState(''); 
  const [province, setProvince] = useState(''); 
  const [postal_code, setPostalCode] = useState(''); 
  const [is_default, setIsDefault] = useState(true); 

  const { user } = useUserStore();
  const userId = user ? user.user_id : null;

  const addressMutation = useMutation({
    mutationFn: (addressData) => createAddress(userId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', userId]);
      alert('Address saved successfully!');
      router.back();
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to save address. Please check your connection.';
      alert(`Error saving address: ${errorMessage}`);
      console.error('Address mutation error:', {
        errorMessage,
        apiUrl,
        userId,
        fullError: error
      });
    }
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleSave = () => {
    if (!address_type.trim() || !street.trim() || !city.trim() || !province.trim() || !postal_code.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const addressData = {
      address_type,
      street,
      city,
      province,
      postal_code,
      is_default
    };

    addressMutation.mutate(addressData);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BackIcon width={24} height={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Primary Address</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          {/* Address Type Input */}
          <TextInput
            style={styles.designInput}
            placeholder="Address Type (e.g., Home, Office)"
            placeholderTextColor="#c0c0c0"
            value={address_type}
            onChangeText={setAddressType}
          />
          
          {/* Street Input */}
          <TextInput
            style={styles.designInput}
            placeholder="Street Address / Zone"
            placeholderTextColor="#c0c0c0"
            value={street}
            onChangeText={setStreet}
            multiline
            numberOfLines={2}
          />
          
          {/* City Input */}
          <TextInput
            style={styles.designInput}
            placeholder="City / Municipality"
            placeholderTextColor="#c0c0c0"
            value={city}
            onChangeText={setCity}
          />
          
          {/* Province Input */}
          <TextInput
            style={styles.designInput}
            placeholder="Province"
            placeholderTextColor="#c0c0c0"
            value={province}
            onChangeText={setProvince}
          />

          {/* Postal Code Input */}
          <TextInput
            style={styles.designInput}
            placeholder="Postal Code"
            placeholderTextColor="#c0c0c0"
            value={postal_code}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* Default Address Toggle */}
          <View style={styles.defaultContainer}>
            <Text style={styles.defaultLabel}>Set as default address</Text>
            <TouchableOpacity 
              style={[styles.toggleButton, is_default && styles.toggleButtonActive]}
              onPress={() => setIsDefault(!is_default)}
            >
              <View style={[styles.toggleCircle, is_default && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity 
          style={[styles.saveButton, addressMutation.isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={addressMutation.isLoading}
        >
          <Text style={styles.saveButtonText}>
            {addressMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditPrimaryAddress;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    padding: 4,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000'
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  formContainer: {
    // Container is primarily for layout/padding
  },
  
  // Input Styles
  designInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
    height: 48,
  },
  
  // Default Address Toggle Styles
  defaultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  defaultLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  
  // Save Button Styles
  saveButton: {
    backgroundColor: '#000',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});