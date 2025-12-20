import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import useUserStore from '../stores/userStore';

const EditProfilePictureModal = ({ visible, userId, currentImage, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { refreshUser, updateUserField } = useUserStore();

  const API_URL = 'http://10.0.2.2:3000/api/users';

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (imageAsset) => {
    setIsLoading(true);
    try {
      // Extract filename from URI or create a default one
      const uriParts = imageAsset.uri.split('/');
      const filename = uriParts[uriParts.length - 1] || `profile_${Date.now()}.jpg`;
      
      // Prepare profile_picture object with metadata
      const profilePictureData = {
        filename: filename,
        mimetype: imageAsset.mimeType || 'image/jpeg',
        data: imageAsset.base64,
        size: imageAsset.fileSize || imageAsset.base64.length
      };
      
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_picture: profilePictureData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile picture');
      }

      // Convert base64 to data URI for local display
      const base64Image = `data:${profilePictureData.mimetype};base64,${imageAsset.base64}`;
      updateUserField('profile_picture', profilePictureData);
      
      await Promise.all([
        queryClient.invalidateQueries(['user', userId]),
        refreshUser()
      ]);
      
      Alert.alert('Success', 'Profile picture updated successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profile_picture: null }),
              });

              if (!response.ok) {
                throw new Error('Failed to remove profile picture');
              }

              updateUserField('profile_picture', null);
              
              await Promise.all([
                queryClient.invalidateQueries(['user', userId]),
                refreshUser()
              ]);
              
              Alert.alert('Success', 'Profile picture removed');
              onClose();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper function to get display image URI
  const getDisplayImageUri = () => {
    if (!currentImage) return null;
    
    // If currentImage is already a data URI or regular URI
    if (typeof currentImage === 'string') {
      return currentImage;
    }
    
    // If currentImage is a profile_picture object with base64 data
    if (currentImage.data && currentImage.mimetype) {
      return `data:${currentImage.mimetype};base64,${currentImage.data}`;
    }
    
    return null;
  };

  const displayUri = getDisplayImageUri();

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
            <Text style={styles.modalTitle}>Profile Picture</Text>
            <Text style={styles.modalSubtitle}>Change your profile photo</Text>
          </View>

          <View style={styles.imagePreviewContainer}>
            {displayUri ? (
              <Image source={{ uri: displayUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderPreview}>
                <Text style={styles.placeholderEmoji}>👤</Text>
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            {displayUri && (
              <TouchableOpacity
                style={[styles.optionButton, styles.removeButton]}
                onPress={removeProfilePicture}
                disabled={isLoading}
              >
                <Text style={styles.removeButtonText}>Remove Current Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}
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
    alignItems: 'center',
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
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    color: '#999',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  removeButton: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 0,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default EditProfilePictureModal;