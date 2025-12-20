import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BackIcon from './backicon.jsx';
import ExpandIcon from '../components/expandicon.jsx'; 
import useUserStore from '../stores/userStore.js';
import EditFieldModal from './EditFieldModal';
import EditProfilePictureModal from './EditProfilePictureModal';

const API_URL = 'http://10.0.2.2:3000/api/users'; 

const UserProfile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: storeUser, refreshUser } = useUserStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const { data: userData } = useQuery({
    queryKey: ['user', storeUser?._id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/${storeUser._id}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      return data.user;
    },
    enabled: !!storeUser?._id,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleEditField = (field, currentValue) => {
    const fieldLabels = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'username': 'Username',
      'email': 'Email',
      'phone_number': 'Phone Number',
      'profile_image': 'Profile Image',
    };

    if (field === 'profile_image') {
      setProfilePictureModalVisible(true);
      return;
    }

    setEditingField(field);
    setEditingLabel(fieldLabels[field] || field);
    setCurrentValue(currentValue);
    setEditModalVisible(true);
  };

  const handleRefresh = async () => {
    try {
      await refreshUser();
      await queryClient.invalidateQueries(['user', storeUser._id]);
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  const profilePicture = userData?.profile_image?.replace('/svg?', '/png?') || null;
  const maskedPhone = userData?.phone_number 
    ? `${'*'.repeat(Math.max(0, userData.phone_number.length - 2))}${userData.phone_number.slice(-2)}`
    : null;
  const maskedEmail = userData?.email
    ? `${userData.email[0]}${'*'.repeat(6)}@${userData.email.split('@')[1]}`
    : null;

  return (
    <View style={styles.container}>
      {/* Modal Components */}
      <EditFieldModal
        visible={editModalVisible}
        field={editingField}
        label={editingLabel}
        currentValue={currentValue}
        userId={storeUser?._id}
        onClose={() => setEditModalVisible(false)}
        onSave={() => {}} // No longer needed but keeping for compatibility
      />

      <EditProfilePictureModal
        visible={profilePictureModalVisible}
        userId={storeUser?._id}
        currentImage={userData?.profile_image}
        onClose={() => setProfilePictureModalVisible(false)}
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BackIcon width={30} height={30} />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>

        {/* Add a refresh button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshText}>⟳</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pfpContainer}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture || null }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>👤</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditField('profile_image', profilePicture)}
          >
            <Text style={styles.edit}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>First Name</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => handleEditField('first_name', userData?.first_name)}
            >
              <Text style={styles.value}>
                {userData?.first_name || 'Not set'}
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Last Name</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => handleEditField('last_name', userData?.last_name)}
            >
              <Text style={styles.value}>
                {userData?.last_name || 'Not set'}
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Username</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => handleEditField('username', userData?.username)}
            >
              <Text style={styles.value}>
                {userData?.username || 'Not set'}
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => handleEditField('phone_number', userData?.phone_number)}
            >
              {maskedPhone ? (
                <>
                  <Text style={styles.value}>{maskedPhone}</Text>
                  <ExpandIcon style={styles.expandIcon} />
                </>
              ) : (
                <Text style={styles.setNow}>Set Now</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => handleEditField('email', userData?.email)}
            >
              <View style={styles.emailRow}>
                <Text style={styles.value}>
                  {maskedEmail || 'Not set'}
                </Text>
                {userData?.email && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Details</Text>
        </View>

        <View style={styles.profileInfoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Wishlist Items</Text>
            <TouchableOpacity style={styles.rightSection}>
              <Text style={styles.value}>
                {userData?.wishlist_ids?.length || 0} items
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Following Sellers</Text>
            <TouchableOpacity style={styles.rightSection}>
              <Text style={styles.value}>
                {userData?.following_seller_ids?.length || 0} sellers
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Addresses</Text>
            <TouchableOpacity 
              style={styles.rightSection}
              onPress={() => router.push('/addresses')}
            >
              <Text style={styles.value}>
                {userData?.addresses?.length || 0} saved
              </Text>
              <ExpandIcon style={styles.expandIcon} />
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 75,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  pfpContainer: {
    paddingVertical: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    color: '#999',
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  edit: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e8e8e8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    minHeight: 52,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  value: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '400',
    marginRight: 4,
  },
  setNow: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  verifiedBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#34C759',
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  expandIcon: {
    marginLeft: 4,
    opacity: 0.5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default UserProfile;