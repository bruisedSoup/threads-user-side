import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import BackIcon from './backicon.jsx';

const SettingsScreen = () => {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleSignOut = () => {
    router.replace('/');
  };

  const handleAccountSecurityPress = () => {
    router.push('./userprofile');
  };
  const handleMyAddressPress = () => {
    router.push('/profile/myaddress');
  };

  const handleBankCardPress = () => {
    router.push('/profile/bank');
  };

  const handleHelpCenterPress = () => {
    router.push('./support/HelpCentreScreen');
  };

  const handleCommunityRulesPress = () => {
    router.push('./support/CommunityRulesScreen');
  };

  const handlePoliciesPress = () => {
    router.push('./support/PoliciesScreen');
  };

  const handleAboutPress = () => {
    router.push('./support/AboutScreen');
  }

  const SettingsItem = ({ label, onPress }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingsItemText}>{label}</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="My Account" />
        <SettingsItem label="Account & Security" onPress={handleAccountSecurityPress}/>
        <SettingsItem label="My Address" onPress={handleMyAddressPress}/>
        <SettingsItem label="Bank Accounts / Cards" onPress={handleBankCardPress}  />

        <SectionHeader title="Settings" />
        <SettingsItem label="Notification Settings" />
        <SettingsItem label="Privacy Settings" />

        <SectionHeader title="Support" />
        <SettingsItem label="Help Centre" onPress={handleHelpCenterPress} />
        <SettingsItem label="Community Rules" onPress={handleCommunityRulesPress} />
        <SettingsItem label="Policies" onPress={handlePoliciesPress} />
        <SettingsItem label="About" onPress={handleAboutPress} />
        {/* <SettingsItem label="Request Account Deletion" /> */}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Switch Account / Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 45,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: '500',
  },
  settingsItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemText: {
    fontSize: 15,
    color: '#000',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#292526',
    paddingVertical: 18,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;