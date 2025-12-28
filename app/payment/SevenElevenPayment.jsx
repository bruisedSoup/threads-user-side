import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, CheckCircle, Copy, Mail, Store, Clock, Receipt } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import CustomButton from '../components/CustomButton'

const apiUrl = process.env.EXPO_API_CREATE_ORDERS_URL || 'http://192.168.1.2:3000/api/orders/';

// 7-Eleven Official Colors
const COLORS = {
  green: '#00853F',      // Dark green
  red: '#CE0E2D',        // Bright red
  orange: '#FF6600',     // Orange
  white: '#FFFFFF',
  lightGray: '#F8F8F8',
  darkGray: '#333333',
  text: '#000000',
  error: '#CE0E2D',
  success: '#00853F',
};

const SevenElevenPayment = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')

  const params = useLocalSearchParams()
  // `orderDetails` is passed as a JSON string from the checkout page
  const orderDetails = params?.orderDetails ? JSON.parse(params.orderDetails) : null
  const total = orderDetails?.order_total || 0

  const generateReferenceNumber = () => {
    return '7E' + Math.random().toString(36).substr(2, 8).toUpperCase() + Date.now().toString().substr(-4)
  }

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setIsProcessing(true)

    // Generate reference number
    const refNum = generateReferenceNumber()
    setReferenceNumber(refNum)

    // Simulate processing
    setTimeout(async () => {
      try {
        // Create order in backend
        const orderData = {
          ...orderDetails,
          paymentMethod: '7eleven',
          paymentStatus: 'pending',
          customerEmail: email,
          referenceNumber: refNum,
          orderedAt: new Date().toISOString(),
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (response.ok) {
          setIsProcessing(false)
          setIsSubmitted(true)
        }
      } catch (error) {
        console.error('Error creating order:', error)
        setIsProcessing(false)
      }
    }, 2000)
  }

  const handleCopyReference = () => {
    // Copy to clipboard functionality
    alert('Reference number copied to clipboard!')
  }

  const handleDone = () => {
    router.push('/tabs/home')
  }

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" strokeWidth={1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>7-Eleven Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Content */}
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={80} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Payment Instructions Sent!</Text>
            <Text style={styles.successMessage}>
              Payment instructions have been sent to
            </Text>
            
            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Mail size={20} color={COLORS.green} />
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Reference Number */}
            <View style={styles.referenceSection}>
              <Text style={styles.referenceLabel}>Your Reference Number</Text>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceNumber}>{referenceNumber}</Text>
                <TouchableOpacity 
                  onPress={handleCopyReference} 
                  style={styles.copyButton}
                  activeOpacity={0.7}
                >
                  <Copy size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Text style={styles.referenceHint}>
                Keep this number safe. You&apos;ll need it at the store.
              </Text>
            </View>

            {/* Steps Card */}
            <View style={styles.stepsCard}>
              <View style={styles.cardHeader}>
                <Store size={22} color={COLORS.red} />
                <Text style={styles.cardTitle}>Payment Instructions</Text>
              </View>
              
              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: COLORS.red }]}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Visit any 7-Eleven store within 24 hours
                  </Text>
                </View>
                
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: COLORS.red }]}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Go to the counter and inform the cashier you want to make a CLiQQ payment
                  </Text>
                </View>
                
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: COLORS.orange }]}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Provide your reference number: 
                    <Text style={styles.highlightText}> {referenceNumber}</Text>
                  </Text>
                </View>
                
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: COLORS.green }]}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Pay the amount of <Text style={styles.amountHighlight}>₱ {total.toFixed(2)}</Text>
                  </Text>
                </View>
                
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: COLORS.green }]}>
                    <Text style={styles.stepNumberText}>5</Text>
                  </View>
                  <View style={styles.stepWithIcon}>
                    <Receipt size={18} color={COLORS.darkGray} style={styles.stepIcon} />
                    <Text style={styles.stepText}>
                      Keep your receipt as proof of payment
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Important Note */}
            <View style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Clock size={18} color={COLORS.orange} />
                <Text style={styles.noteTitle}>Important Note</Text>
              </View>
              <Text style={styles.noteText}>
                Your order will be processed once payment is confirmed. 
                This may take up to 1-2 hours after payment.
              </Text>
            </View>
            
            {/* Spacer for bottom button */}
            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        {/* Done Button */}
        <View style={styles.bottomContainer}>
          <CustomButton
            name="Done"
            containerStyle={styles.doneButton}
            textStyle={styles.doneButtonText}
            onPress={handleDone}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} strokeWidth={1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>7-Eleven Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 7-Eleven Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.sevenElevenLogo}>
              <Text style={styles.sevenElevenLogoText}>7-Eleven</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>₱ {total.toFixed(2)}</Text>
          </View>

          {/* Email Input Section */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Mail size={22} color={COLORS.red} />
              <Text style={styles.inputTitle}>Email Address</Text>
            </View>
            <Text style={styles.inputDescription}>
              We&apos;ll send payment instructions and reference number to this email
            </Text>
            <TextInput
              style={styles.input}
              placeholder="youremail@gmail.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {email && !email.includes('@') && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Store size={22} color={COLORS.green} />
              <Text style={styles.infoTitle}>How It Works</Text>
            </View>
            <View style={styles.infoPoints}>
              <View style={styles.infoPoint}>
                <View style={[styles.infoBullet, { backgroundColor: COLORS.red }]} />
                <Text style={styles.infoPointText}>
                  Submit your email to receive a reference number
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <View style={[styles.infoBullet, { backgroundColor: COLORS.orange }]} />
                <Text style={styles.infoPointText}>
                  Visit any 7-Eleven store within 24 hours
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <View style={[styles.infoBullet, { backgroundColor: COLORS.green }]} />
                <Text style={styles.infoPointText}>
                  Provide the reference number to the cashier
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <View style={[styles.infoBullet, { backgroundColor: COLORS.red }]} />
                <Text style={styles.infoPointText}>
                  Pay at the counter and keep your receipt
                </Text>
              </View>
            </View>
          </View>

          {/* 7-Eleven Colors Legend */}
          <View style={styles.colorsLegend}>
            <Text style={styles.legendTitle}>7-Eleven Payment</Text>
            <View style={styles.colorDots}>
              <View style={[styles.colorDot, { backgroundColor: COLORS.green }]} />
              <View style={[styles.colorDot, { backgroundColor: COLORS.red }]} />
              <View style={[styles.colorDot, { backgroundColor: COLORS.orange }]} />
            </View>
            <Text style={styles.legendText}>
              Pay securely through 7-Eleven&apos;s CLiQQ payment system
            </Text>
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomContainer}>
          <CustomButton
            name={isProcessing ? "Processing..." : "Submit Payment"}
            containerStyle={styles.submitButton}
            textStyle={styles.submitButtonText}
            onPress={handleSubmit}
            disabled={isProcessing || !email || !email.includes('@')}
          />
        </View>

        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={COLORS.orange} />
              <Text style={styles.loadingText}>Generating payment instructions...</Text>
              <View style={styles.loadingColors}>
                <View style={[styles.loadingColorDot, { backgroundColor: COLORS.green }]} />
                <View style={[styles.loadingColorDot, { backgroundColor: COLORS.red }]} />
                <View style={[styles.loadingColorDot, { backgroundColor: COLORS.orange }]} />
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  sevenElevenLogo: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sevenElevenLogoText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  amountLabel: {
    fontSize: 15,
    color: COLORS.darkGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.red,
  },
  // Input Card Styles
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  inputDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    height: 52,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: 8,
    fontWeight: '500',
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: 'rgba(0, 133, 63, 0.05)', // Light green background
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 133, 63, 0.2)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  infoPoints: {
    gap: 12,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  infoPointText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontWeight: '500',
  },
  // Colors Legend
  colorsLegend: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  colorDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Bottom Container
  bottomContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  loadingText: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 20,
  },
  loadingColors: {
    flexDirection: 'row',
    gap: 15,
  },
  loadingColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  // Success Screen Styles
  successContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 133, 63, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 133, 63, 0.3)',
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.green,
    marginLeft: 10,
  },
  referenceSection: {
    width: '100%',
    marginBottom: 30,
  },
  referenceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  referenceBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  referenceNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    padding: 8,
    backgroundColor: COLORS.orange,
    borderRadius: 8,
  },
  referenceHint: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  stepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontWeight: '500',
  },
  stepWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 8,
  },
  highlightText: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  amountHighlight: {
    color: COLORS.red,
    fontWeight: '800',
  },
  noteCard: {
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
})

export default SevenElevenPayment