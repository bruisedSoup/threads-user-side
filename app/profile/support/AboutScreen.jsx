import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  const teamMembers = [
    { id: 1, name: 'Alex Morgan', role: 'Founder & CEO', initials: 'AM' },
    { id: 2, name: 'Sam Rivera', role: 'Head of Design', initials: 'SR' },
    { id: 3, name: 'Jordan Lee', role: 'Marketing Director', initials: 'JL' },
    { id: 4, name: 'Taylor Kim', role: 'Customer Experience', initials: 'TK' },
  ];

  const milestones = [
    { year: '2020', event: 'THREADS founded with a vision for sustainable fashion' },
    { year: '2021', event: 'Launched first collection with 100% organic materials' },
    { year: '2022', event: 'Expanded to 50+ countries worldwide' },
    { year: '2023', event: 'Reached 1 million happy customers' },
  ];

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>THREADS</Text>
          <Text style={styles.tagline}>Style that fits your life</Text>
        </View>
        
        {/* Mission */}
        <View style={styles.section}>
          <View style={styles.missionCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="earth-outline" size={28} color="#000" />
            </View>
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              To make sustainable fashion accessible to everyone while maintaining ethical production practices and reducing environmental impact.
            </Text>
          </View>
        </View>
        
        {/* Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.bodyText}>
            THREADS began as a school project in 2020, born from a simple idea: create clothing that&apos;s both stylish and sustainable. What started in a dorm room has grown into a community of fashion-forward individuals who care about quality and the planet.
          </Text>
        </View>
        
        {/* Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            <View style={styles.valueCard}>
              <Ionicons name="leaf-outline" size={32} color="#000" />
              <Text style={styles.valueTitle}>Sustainability</Text>
              <Text style={styles.valueDesc}>Eco-friendly materials and processes</Text>
            </View>
            <View style={styles.valueCard}>
              <Ionicons name="people-outline" size={32} color="#000" />
              <Text style={styles.valueTitle}>Community</Text>
              <Text style={styles.valueDesc}>Building connections through fashion</Text>
            </View>
            <View style={styles.valueCard}>
              <Ionicons name="diamond-outline" size={32} color="#000" />
              <Text style={styles.valueTitle}>Quality</Text>
              <Text style={styles.valueDesc}>Durable products that last</Text>
            </View>
            <View style={styles.valueCard}>
              <Ionicons name="heart-outline" size={32} color="#000" />
              <Text style={styles.valueTitle}>Ethics</Text>
              <Text style={styles.valueDesc}>Fair wages and safe conditions</Text>
            </View>
          </View>
        </View>
        
        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet The Team</Text>
          <Text style={{ ...styles.bodyText, marginBottom: 20 }}>
            The passionate people behind THREADS
          </Text>
          <View style={styles.teamGrid}>
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.teamMember}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.initials}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <View style={styles.timeline}>
            {milestones.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={styles.timelineDot} />
                  {index < milestones.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineYear}>{item.year}</Text>
                  <Text style={styles.timelineEvent}>{item.event}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://instagram.com')}
            >
              <Ionicons name="logo-instagram" size={24} color="#000" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://twitter.com')}
            >
              <Ionicons name="logo-twitter" size={24} color="#000" />
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://facebook.com')}
            >
              <Ionicons name="logo-facebook" size={24} color="#000" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>THREADS</Text>
          <Text style={styles.footerText}>123 Fashion Avenue, Style City</Text>
          <Text style={styles.footerText}>contact@threads.com • (555) 123-4567</Text>
          <Text style={styles.copyright}>© 2023 THREADS. A School Project.</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#666',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  missionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  missionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  valueCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  valueCardInner: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  valueDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  teamMember: {
    width: '50%',
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLine: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e5e5',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 0,
  },
  timelineYear: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  timelineEvent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  socialText: {
    fontSize: 13,
    color: '#000',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#000',
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  copyright: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
  },
});

export default AboutScreen;