import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommunityRulesScreen = () => {
  const rules = [
    {
      id: 1,
      icon: 'heart-outline',
      title: 'Be Respectful',
      description: 'Treat all community members with kindness and respect. No harassment, hate speech, or bullying will be tolerated.',
    },
    {
      id: 2,
      icon: 'chatbubble-outline',
      title: 'Stay On Topic',
      description: 'Keep discussions relevant to THREADS products, fashion, and related topics.',
    },
    {
      id: 3,
      icon: 'shield-checkmark-outline',
      title: 'No Spam or Self-Promotion',
      description: 'Avoid excessive posting, advertising, or promoting other brands without permission.',
    },
    {
      id: 4,
      icon: 'camera-outline',
      title: 'Appropriate Content Only',
      description: 'No NSFW content, illegal activities, or inappropriate imagery. Keep it family-friendly.',
    },
    {
      id: 5,
      icon: 'alert-circle-outline',
      title: 'Report Issues',
      description: 'If you see something that violates our rules, please report it using the flag icon.',
    },
    {
      id: 6,
      icon: 'star-outline',
      title: 'Share Your Style',
      description: 'We encourage sharing outfit ideas, styling tips, and honest product reviews.',
    },
  ];

  const consequences = [
    'Warning for minor violations',
    'Temporary suspension for repeated offenses',
    'Permanent ban for severe or continued violations',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Rules</Text>
        <Text style={styles.headerSubtitle}>Creating a positive space for everyone</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <View style={styles.introIcon}>
            <Ionicons name="people-outline" size={24} color="#000" />
          </View>
          <Text style={styles.introText}>
            Welcome to the THREADS community! These rules help ensure a safe and enjoyable experience for all members.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Community Guidelines</Text>
          
          {rules.map((rule) => (
            <View key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleIconContainer}>
                <Ionicons name={rule.icon} size={20} color="#000" />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDescription}>{rule.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.consequencesBox}>
          <View style={styles.consequencesHeader}>
            <Ionicons name="warning-outline" size={22} color="#000" />
            <Text style={styles.consequencesTitle}>Consequences for Violations</Text>
          </View>
          <View style={styles.consequencesList}>
            {consequences.map((item, index) => (
              <View key={index} style={styles.consequenceItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.consequenceText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            These rules are subject to updates. By participating in our community, you agree to follow these guidelines.
          </Text>
          <Text style={styles.lastUpdated}>Last updated: December 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introBox: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  ruleCard: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ruleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  consequencesBox: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  consequencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consequencesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  consequencesList: {
    paddingLeft: 4,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginTop: 7,
    marginRight: 12,
  },
  consequenceText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
  footerNote: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default CommunityRulesScreen;