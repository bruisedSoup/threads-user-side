import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PoliciesScreen = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const policies = [
    {
      id: 1,
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      content: 'We collect personal information (name, email, shipping address) to process orders and improve your shopping experience. We never sell your data to third parties. You can request data deletion anytime by contacting support.',
      subsections: [
        'Data collection & usage',
        'Third-party services',
        'Your rights & choices',
        'Security measures',
      ],
    },
    {
      id: 2,
      title: 'Shipping Policy',
      icon: 'car-outline',
      content: 'Orders are processed within 1-2 business days. Standard shipping: 3-5 business days ($4.99). Express shipping: 1-2 business days ($9.99). Free shipping on orders over $50. International shipping available to select countries.',
      subsections: [
        'Processing time',
        'Shipping rates',
        'Order tracking',
        'International shipping',
      ],
    },
    {
      id: 3,
      title: 'Return & Refund Policy',
      icon: 'refresh-outline',
      content: 'Items must be returned within 30 days of delivery in original condition with tags attached. Refunds processed within 5-10 business days to original payment method. Sale items are final sale unless defective.',
      subsections: [
        'Return window',
        'Condition requirements',
        'Refund timeline',
        'Exclusions',
      ],
    },
    {
      id: 4,
      title: 'Terms of Service',
      icon: 'document-text-outline',
      content: 'By using THREADS, you agree to our terms. You must be at least 13 years old to create an account. We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.',
      subsections: [
        'Account responsibilities',
        'Product descriptions',
        'Limitation of liability',
        'Governing law',
      ],
    },
    {
      id: 5,
      title: 'Cookie Policy',
      icon: 'analytics-outline',
      content: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings, but some features may not function properly without them.',
      subsections: [
        'Essential cookies',
        'Analytics cookies',
        'Advertising cookies',
        'Managing preferences',
      ],
    },
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Policies</Text>
        <Text style={styles.headerSubtitle}>Important legal information</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Ionicons name="information-circle-outline" size={28} color="#000" />
          </View>
          <Text style={styles.noticeText}>
            Please review our policies carefully. By using THREADS, you agree to these terms.
          </Text>
        </View>
        
        <View style={styles.policiesContainer}>
          {policies.map((policy) => (
            <TouchableOpacity
              key={policy.id}
              style={styles.policyCard}
              onPress={() => toggleSection(policy.id)}
              activeOpacity={0.7}
            >
              <View style={styles.policyHeader}>
                <View style={styles.policyTitleRow}>
                  <View style={styles.policyIconCircle}>
                    <Ionicons name={policy.icon} size={20} color="#000" />
                  </View>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                </View>
                <Ionicons 
                  name={expandedSection === policy.id ? "chevron-up" : "chevron-down"} 
                  size={22} 
                  color="#000" 
                />
              </View>
              
              {expandedSection === policy.id && (
                <View style={styles.policyContent}>
                  <Text style={styles.policyDescription}>{policy.content}</Text>
                  
                  <Text style={styles.subsectionsTitle}>Key Points:</Text>
                  <View style={styles.subsectionsList}>
                    {policy.subsections.map((subsection, index) => (
                      <View key={index} style={styles.subsectionItem}>
                        <View style={styles.subsectionDot} />
                        <Text style={styles.subsectionText}>{subsection}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity style={styles.readMoreButton}>
                    <Text style={styles.readMoreText}>Read Full Policy</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Questions About Our Policies?</Text>
          <Text style={styles.contactText}>
            If you have any questions or concerns about our policies, please contact our legal team.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Legal Team</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.updateText}>
          Policies last updated: November 15, 2023
        </Text>
        
        <View style={styles.bottomSpace} />
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
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    margin: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  noticeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  policiesContainer: {
    paddingHorizontal: 24,
  },
  policyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  policyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  policyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  policyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  policyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 20,
  },
  subsectionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  subsectionsList: {
    marginBottom: 20,
  },
  subsectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subsectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginTop: 6,
    marginRight: 12,
  },
  subsectionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  readMoreText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  contactCard: {
    backgroundColor: '#000',
    margin: 24,
    marginTop: 32,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 15,
    color: '#e5e5e5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  contactButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  updateText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  bottomSpace: {
    height: 24,
  },
});

export default PoliciesScreen;