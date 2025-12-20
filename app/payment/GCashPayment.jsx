import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, Download, Share2, CheckCircle, Smartphone, Scan } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import CustomButton from '../components/CustomButton'

const apiUrl = process.env.EXPO_API_CREATE_ORDERS_URL || 'http://10.0.2.2:3000/api/orders/';

const GCashPayment = () => {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const params = useLocalSearchParams()
  
  const orderDetails = params?.orderDetails ? JSON.parse(params.orderDetails) : null
  const total = orderDetails?.order_total || 0

  const handleOpenGCash = () => {
    alert('Opening GCash app...')
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    
    setTimeout(async () => {
      try {
        const orderData = {
          ...orderDetails,
          paymentMethod: 'gcash',
          paymentStatus: 'paid',
          orderedAt: new Date().toISOString(),
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (response.ok) {
          setIsPaid(true)
          setIsProcessing(false)
          
          setTimeout(() => {
            router.push('/tabs/home')
          }, 2000)
        }
      } catch (error) {
        console.error('Error creating order:', error)
        setIsProcessing(false)
      }
    }, 2000)
  }

  if (isPaid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#00b300" />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Your order has been placed successfully
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#000" strokeWidth={1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GCash Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GCash Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.gcashLogo}>
            <Text style={styles.gcashLogoText}>GCash</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₱ {total.toFixed(2)}</Text>
        </View>

        {/* Payment Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Scan size={20} color="#007AFF" />
            <Text style={styles.instructionsTitle}>How to Pay</Text>
          </View>
          <View style={styles.instructionSteps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Open your GCash app</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Tap &quot;Scan QR&quot;</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Scan the QR code below</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Confirm payment details</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={styles.stepText}>Enter your MPIN</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>Scan QR Code</Text>
          <View style={styles.qrCodeBox}>
            <View style={styles.qrCode}>
              <View style={styles.qrPattern}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                  <View key={row} style={styles.qrRow}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                      <View 
                        key={col} 
                        style={[
                          styles.qrCell,
                          Math.random() > 0.5 && styles.qrCellFilled
                        ]} 
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.qrInstruction}>
            Scan this code using your GCash app to pay ₱ {total.toFixed(2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Save QR</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Smartphone size={20} color="#666" />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            • Payment will be automatically verified{'\n'}
            • Keep this screen open until payment is confirmed{'\n'}
            • You&apos;ll be redirected once payment is successful{'\n'}
            • Contact support if you encounter any issues
          </Text>
        </View>

        {/* Spacer for bottom buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <CustomButton
          name="Open GCash App"
          containerStyle={styles.openAppButton}
          textStyle={styles.openAppButtonText}
          onPress={handleOpenGCash}
        />
        <CustomButton
          name={isProcessing ? "Processing..." : "I've Paid"}
          containerStyle={styles.confirmButton}
          textStyle={styles.confirmButtonText}
          onPress={handleConfirmPayment}
          disabled={isProcessing}
        />
      </View>

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verifying payment...</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  gcashLogo: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gcashLogoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ecff',
  },
  amountLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#007AFF',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 10,
  },
  instructionSteps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  qrCodeBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e8ecff',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  qrCode: {
    width: 220,
    height: 220,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  qrPattern: {
    width: '100%',
    height: '100%',
    padding: 10,
  },
  qrRow: {
    flexDirection: 'row',
    flex: 1,
  },
  qrCell: {
    flex: 1,
    margin: 1,
    backgroundColor: '#fff',
  },
  qrCellFilled: {
    backgroundColor: '#000',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8ecff',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e8ecff',
  },
  infoCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8ecff',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  openAppButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openAppButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    marginTop: 25,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})

export default GCashPayment