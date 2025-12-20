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

const HelpCentreScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqItems = [
    { id: 1, title: 'How to place an order?', answer: 'Navigate to the product, select size/color, and tap "Add to Cart".' },
    { id: 2, title: 'What payment methods do you accept?', answer: 'We accept credit/debit cards, PayPal, and Apple Pay.' },
    { id: 3, title: 'How long does shipping take?', answer: 'Standard shipping: 3-5 business days. Express: 1-2 business days.' },
    { id: 4, title: 'What is your return policy?', answer: 'Items can be returned within 30 days of purchase with original tags.' },
    { id: 5, title: 'How do I track my order?', answer: 'Use the tracking number sent to your email or check in "My Orders".' },
  ];

  const contactMethods = [
    { id: 1, icon: 'mail-outline', title: 'Email Support', detail: 'support@threads.com' },
    { id: 2, icon: 'call-outline', title: 'Phone Support', detail: '+1 (800) 123-4567' },
    { id: 3, icon: 'chatbubble-outline', title: 'Live Chat', detail: 'Available 9AM-6PM EST' },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help Centre</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.faqItem}
              onPress={() => toggleFAQ(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqTitle}>{item.title}</Text>
                <Ionicons 
                  name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </View>
              {expandedFAQ === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          {contactMethods.map((method) => (
            <View key={method.id} style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Ionicons name={method.icon} size={22} color="#000" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDetail}>{method.detail}</Text>
              </View>
            </View>
          ))}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  faqItem: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#000',
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    lineHeight: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default HelpCentreScreen;