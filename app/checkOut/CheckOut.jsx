import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, MoreHorizontal, ChevronDown, Wallet, CreditCard, Banknote, Building2 } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
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

  // Calculate totals
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

  const handlePay = async () => {
    // Prepare order details
    const orderDetails = {
      user_id: user.user_id,
      items: cart.flatMap(store => 
        store.products
          .filter(p => selectedProducts.includes(p.id))
          .map(p => ({
            _id: p.id,
            name: p.title,
            price: p.price,
            quantity: p.quantity,
            image: p.image,
            storeName: store.storeName,
          }))
      ),
      subtotal,
      shippingFee,
      discount,
      total,
      totalItems,
    }

    // Handle different payment methods
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
        // For COD, create order directly
        try {
          const orderData = {
            ...orderDetails,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderedAt: new Date().toISOString(),
          }
          
          await createOrderInBackend(orderData)
          router.push('/tabs/home')
        } catch (error) {
          console.error('Error creating order:', error)
          alert('Failed to place order. Please try again.')
        }
        break
      
      case 'card':
        // For card payment, you can add a card payment page similar to GCash
        alert('Card payment coming soon!')
        break
      
      default:
        alert('Please select a payment method')
    }
  }

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
        {/* Cart Items */}
        <View style={styles.section}>
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

        {/* Shipping Information */}
        {selectedPaymentMethod === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Information</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <View style={styles.visaLogo}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                <Text style={styles.cardNumber}>**** **** **** 2143</Text>
              </View>
              <ChevronDown size={20} color="#666" />
            </View>
          </View>
        )}

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
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
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
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaLogo: {
    backgroundColor: '#1a1f71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  visaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardNumber: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
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
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default CheckOut