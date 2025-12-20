import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, MoreHorizontal, ChevronDown, Wallet, CreditCard, Banknote, Building2, MapPin, Check } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import React, { useState, useEffect, useRef } from 'react'
import CartCard from '../components/CartCard'
import CustomButton from '../components/CustomButton'
import useCartStore from '../stores/cartStore'
import useSelectionStore from '../stores/useSelectionStore'
import useUserStore from '../stores/userStore'

const apiUrl = process.env.EXPO_API_CREATE_ORDERS_URL || 'http://10.0.2.2:3000/api/orders/';

const createOrderInBackend = async (order) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  if (!response.ok) throw new Error("Failed to create order in backend");
};

const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: 'banknote',
  },
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay with GCash wallet',
    icon: 'wallet',
  },
  {
    id: '7eleven',
    name: '7-Eleven',
    description: 'Pay at any 7-Eleven store',
    icon: 'building',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'VISA, Mastercard, etc.',
    icon: 'credit-card',
  },
]

const CheckOut = () => {
  const router = useRouter()
  const { cart } = useCartStore()
  const { user } = useUserStore()
  const { selectedProducts } = useSelectionStore()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null) // 'success', 'error', or null
  const [lastOrderDetails, setLastOrderDetails] = useState(null)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const checkmarkAnim = useRef(new Animated.Value(0)).current

  const userAddresses = user?.addresses || []
  const defaultAddress = userAddresses.find(addr => addr.is_default) || userAddresses[0]

  const { mutate: createOrder, isLoading, isError, error } = useMutation({
    mutationFn: createOrderInBackend,
    onSuccess: () => {
      console.log('Order created successfully')
      setOrderStatus('success')
      scaleAnim.setValue(1)
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start()
    },
    onError: (error) => {
      console.error('Error creating order:', error)
      setOrderStatus('error')
      scaleAnim.setValue(1)
    },
  })

  useEffect(() => {
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress)
    }
  }, [defaultAddress])

  useEffect(() => {
    if (isProcessing && !orderStatus) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start()

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start()

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else if (!isProcessing && !orderStatus) {
      scaleAnim.setValue(0)
      rotateAnim.setValue(0)
      pulseAnim.setValue(1)
      checkmarkAnim.setValue(0)
    } else if (orderStatus) {
      scaleAnim.setValue(1)
      rotateAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isProcessing, orderStatus])

  const totalItems = cart.reduce((sum, store) => {
    return sum + store.products.reduce((s, p) => {
      if (selectedProducts.includes(p.id)) {
        return s + (p.quantity || 1)
      }
      return s
    }, 0)
  }, 0)

  const subtotal = cart.reduce((sum, store) => {
    return sum + store.products.reduce((s, p) => {
      if (selectedProducts.includes(p.id)) {
        return s + (Number(p.price || 0) * (p.quantity || 1))
      }
      return s
    }, 0)
  }, 0)

  const shippingFee = 0  
  const discount = 0
  const total = subtotal + shippingFee - discount

  const getPaymentIcon = (iconName) => {
    switch (iconName) {
      case 'banknote':
        return <Banknote size={24} color="#333" />
      case 'wallet':
        return <Wallet size={24} color="#333" />
      case 'building':
        return <Building2 size={24} color="#333" />
      case 'credit-card':
        return <CreditCard size={24} color="#333" />
      default:
        return <Wallet size={24} color="#333" />
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    setShowAddressModal(false)
  }

  const handlePay = async () => {
    if (selectedPaymentMethod === 'cod' && !selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    const orderDetails = {
      user_id: user._id,
      order_total: total,
      items: cart.flatMap(store => 
        store.products
          .filter(p => selectedProducts.includes(p.id))
          .map(p => ({
            product_id: p.id,
            quantity: p.quantity || 1,
            product_snapshot: {
              name: p.title,
              price: Number(p.price)
            }
          }))
      ),
      shipping_address_snapshot: {
        street: selectedAddress?.street || 'N/A',
        city: selectedAddress?.city || 'N/A',
        province: selectedAddress?.province || 'N/A',
        postal_code: selectedAddress?.postal_code || 'N/A'
      },
      payment_details: {
        payment_method: selectedPaymentMethod,
        amount: total,
        status: selectedPaymentMethod === 'gcash' ? 'paid' : 'pending'
      },
      status_history: [
        {
          status: 'pending',
          date: new Date(),
          notes: 'Order created'
        }
      ]
    }

    switch (selectedPaymentMethod) {
      case 'gcash':
        router.push({
          pathname: '/payment/GCashPayment',
          params: { orderDetails: JSON.stringify(orderDetails) }
        })
        break
      
      case '7eleven':
        router.push({
          pathname: '/payment/SevenElevenPayment',
          params: { orderDetails: JSON.stringify(orderDetails) }
        })
        break
      
      case 'cod':
        setIsProcessing(true)
        setLastOrderDetails(orderDetails)
        createOrder(orderDetails)
        break
      
      case 'card':
        alert('Card payment coming soon!')
        break
      
      default:
        alert('Please select a payment method')
    }
  }
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#000" strokeWidth={1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MoreHorizontal size={24} color="#000" strokeWidth={1} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section - Only show for COD */}
        {selectedPaymentMethod === 'cod' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {selectedAddress ? (
              <TouchableOpacity 
                style={styles.addressCard}
                onPress={() => setShowAddressModal(true)}
              >
                <View style={styles.addressHeader}>
                  <MapPin size={20} color="#333" />
                  <View style={styles.addressContent}>
                    <View style={styles.addressNameRow}>
                      <Text style={styles.addressType}>{selectedAddress.address_type}</Text>
                      {selectedAddress.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressDetail}>{selectedAddress.street}</Text>
                    <Text style={styles.addressDetail}>
                      {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.postal_code}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#666" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.noAddressCard}
                onPress={() => setShowAddressModal(true)}
              >
                <Text style={styles.noAddressText}>Select delivery address</Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {cart.map((store) => (
            <View key={store.storeName}>
              {store.products
                .filter(product => selectedProducts.includes(product.id))
                .map((product) => (
                  <CartCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    title={product.title}
                    price={product.price}
                    type={product.type}
                    quantity={product.quantity}
                  />
                ))
              }
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={[
                    styles.iconContainer,
                    selectedPaymentMethod === method.id && styles.iconContainerSelected
                  ]}>
                    {getPaymentIcon(method.icon)}
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[
                      styles.paymentMethodName,
                      selectedPaymentMethod === method.id && styles.paymentMethodNameSelected
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={styles.paymentMethodDescription}>
                      {method.description}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total ({totalItems} items)</Text>
              <Text style={styles.summaryValue}>Php {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>Php 0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>Php 0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Sub Total</Text>
              <Text style={styles.totalValue}>Php {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.payButtonContainer}>
        <CustomButton
          name="Pay"
          containerStyle={styles.payButton}
          textStyle={styles.payButtonText}
          onPress={handlePay}
        />
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {userAddresses.length > 0 ? (
                userAddresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalAddressCard,
                      selectedAddress === address && styles.modalAddressCardSelected
                    ]}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.modalAddressContent}>
                      <View style={styles.modalAddressHeader}>
                        <Text style={styles.modalAddressType}>{address.address_type}</Text>
                        {address.is_default && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalAddressDetail}>{address.street}</Text>
                      <Text style={styles.modalAddressDetail}>
                        {address.city}, {address.province}, {address.postal_code}
                      </Text>
                    </View>
                    {selectedAddress === address && (
                      <Check size={24} color="#000" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noAddressesContainer}>
                  <Text style={styles.noAddressesText}>No addresses found</Text>
                  <TouchableOpacity 
                    style={styles.addAddressButton}
                    onPress={() => {
                      setShowAddressModal(false)
                      router.push('/profile/newaddress')
                    }}
                  >
                    <Text style={styles.addAddressButtonText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal
        visible={isProcessing}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <Animated.View style={[
            styles.loadingContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            {!orderStatus ? (
              // Loading State
              <>
                <Animated.View style={[
                  styles.spinnerContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <View style={styles.spinner}>
                      <View style={styles.spinnerSegment} />
                      <View style={[styles.spinnerSegment, styles.spinnerSegment2]} />
                      <View style={[styles.spinnerSegment, styles.spinnerSegment3]} />
                    </View>
                  </Animated.View>
                </Animated.View>
                
                <Text style={styles.loadingTitle}>Processing Order</Text>
                <Text style={styles.loadingSubtitle}>Please wait...</Text>
                
                <View style={styles.dotsContainer}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </>
            ) : orderStatus === 'success' ? (
              <>
                <Animated.View style={[
                  styles.successIconContainer,
                  { transform: [{ scale: checkmarkAnim }] }
                ]}>
                  <View style={styles.successCircle}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                </Animated.View>
                
                <Text style={styles.successTitle}>Order Placed!</Text>
                <Text style={styles.successSubtitle}>Your order has been successfully placed</Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
                  <TouchableOpacity
                    style={[styles.payButton, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#000' }]}
                    onPress={() => {
                      setIsProcessing(false)
                      setOrderStatus(null)
                      router.push('/tabs/home')
                    }}
                  >
                    <Text style={[styles.payButtonText, { color: '#000' }]}>Continue Shopping</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.payButton, { flex: 1 }]}
                    onPress={() => {
                      setIsProcessing(false)
                      setOrderStatus(null)
                      router.push('/profile/myorders/allorders')
                    }}
                  >
                    <Text style={styles.payButtonText}>View Orders</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Error State
              <>
                <View style={styles.errorIconContainer}>
                  <View style={styles.errorCircle}>
                    <Text style={styles.errorIcon}>✕</Text>
                  </View>
                </View>
                
                <Text style={styles.errorTitle}>Order Failed</Text>
                <Text style={styles.errorSubtitle}>Something went wrong. Please try again.</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
                  <TouchableOpacity
                    style={[styles.payButton, { flex: 1 }]}
                    onPress={() => {
                      // Retry the last order
                      if (lastOrderDetails) {
                        setOrderStatus(null)
                        setIsProcessing(true)
                        createOrder(lastOrderDetails)
                      }
                    }}
                  >
                    <Text style={styles.payButtonText}>Retry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.payButton, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }]}
                    onPress={() => {
                      setIsProcessing(false)
                      setOrderStatus(null)
                    }}
                  >
                    <Text style={[styles.payButtonText, { color: '#000' }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  // Address Card Styles
  addressCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressContent: {
    flex: 1,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noAddressCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noAddressText: {
    fontSize: 14,
    color: '#999',
  },
  // Payment Method Styles
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentMethodCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#000',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#e6f3ff',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodNameSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#000',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  // Summary Styles
  summaryContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  payButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  payButton: {
    backgroundColor: 'black',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalScroll: {
    padding: 20,
  },
  modalAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  modalAddressCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#000',
  },
  modalAddressContent: {
    flex: 1,
  },
  modalAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modalAddressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  modalAddressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noAddressesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAddressesText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  addAddressButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading Modal Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  spinnerContainer: {
    marginBottom: 24,
  },
  spinner: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  spinnerSegment: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderWidth: 4,
    borderRadius: 40,
    borderColor: '#000',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  spinnerSegment2: {
    borderColor: '#666',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '120deg' }],
  },
  spinnerSegment3: {
    borderColor: '#ccc',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '240deg' }],
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  // Success State Styles
  successIconContainer: {
    marginBottom: 24,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Error State Styles
  errorIconContainer: {
    marginBottom: 24,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})

export default CheckOut;