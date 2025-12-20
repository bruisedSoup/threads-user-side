import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackIcon from '../backicon';
import StoreIcon from '../../components/storeicon';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchOrderDetails = async (orderId) => {
  const apiUrl = process.env.EXPO_API_ORDERS_URL || 'http://10.0.2.2:3000/api/orders';
  const response = await fetch(`${apiUrl}/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order details');
  }
  const data = await response.json();
  return data.order;
};

const cancelOrder = async (orderId) => {
  const apiUrl = process.env.EXPO_API_ORDERS_URL || 'http://10.0.2.2:3000/api/orders';
  const response = await fetch(`${apiUrl}/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'cancelled',
      notes: 'Order cancelled by customer',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  const data = await response.json();
  return data.order;
};

const OrderDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderDetails(id),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', id], updatedOrder);
      setShowCancelModal(false);
      Alert.alert(
        'Order Cancelled',
        'Your order has been cancelled successfully.',
        [{ text: 'OK' }]
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      setShowCancelModal(false);
      Alert.alert(
        'Cancellation Failed',
        error.message || 'Unable to cancel order. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const handleBackPress = () => router.back();

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    cancelMutation.mutate();
  };

  const getLatestStatus = () => {
    if (order?.status_history && order.status_history.length > 0) {
      return order.status_history[order.status_history.length - 1];
    }
    return { status: 'Unknown', date: null };
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
      case 'unpaid':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
      case 'returned':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const renderStatusTimeline = () => {
    if (!order?.status_history || order.status_history.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status Timeline</Text>
        <View style={styles.timelineContainer}>
          {order.status_history.map((statusItem, index) => {
            const isLast = index === order.status_history.length - 1;
            const statusDate = new Date(statusItem.date);
            const formattedDate = statusDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = statusDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View 
                    style={[
                      styles.timelineDot, 
                      { backgroundColor: getStatusColor(statusItem.status) },
                      isLast && styles.timelineDotActive
                    ]} 
                  />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[styles.timelineStatus, isLast && styles.timelineStatusActive]}>
                    {statusItem.status}
                  </Text>
                  <Text style={styles.timelineDate}>{formattedDate} • {formattedTime}</Text>
                  {statusItem.notes && (
                    <Text style={styles.timelineNotes}>{statusItem.notes}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderShippingInfo = () => {
    if (!order?.shipping_address_snapshot) return null;

    const address = order.shipping_address_snapshot;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <StoreIcon width={18} height={18} style={styles.addressIcon} />
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>
                {address.city}, {address.province}
              </Text>
              <Text style={styles.addressText}>{address.postal_code}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderShipmentDetails = () => {
    const latestStatus = getLatestStatus();
    const statusLower = latestStatus.status.toLowerCase();
    
    const shouldShowShipment = ['shipped', 'delivered', 'processing'].includes(statusLower);
    
    if (!shouldShowShipment) return null;

    const shipment = order?.shipment_details;
    const hasShipmentData = shipment && (
      shipment.tracking_number || 
      shipment.carrier || 
      shipment.estimated_delivery || 
      shipment.status
    );

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipment Details</Text>
        <View style={styles.shipmentCard}>
          {hasShipmentData ? (
            <>
              {shipment.tracking_number ? (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Tracking Number:</Text>
                  <Text style={styles.shipmentValue}>{shipment.tracking_number}</Text>
                </View>
              ) : (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Tracking Number:</Text>
                  <Text style={styles.shipmentValuePending}>Pending</Text>
                </View>
              )}
              
              {shipment.carrier ? (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Carrier:</Text>
                  <Text style={styles.shipmentValue}>{shipment.carrier}</Text>
                </View>
              ) : (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Carrier:</Text>
                  <Text style={styles.shipmentValuePending}>To be assigned</Text>
                </View>
              )}
              
              {shipment.estimated_delivery ? (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Est. Delivery:</Text>
                  <Text style={styles.shipmentValue}>
                    {new Date(shipment.estimated_delivery).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              ) : (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Est. Delivery:</Text>
                  <Text style={styles.shipmentValuePending}>To be determined</Text>
                </View>
              )}
              
              {shipment.status && (
                <View style={styles.shipmentRow}>
                  <Text style={styles.shipmentLabel}>Shipment Status:</Text>
                  <View style={[styles.shipmentStatusBadge, { backgroundColor: getStatusColor(shipment.status) }]}>
                    <Text style={styles.shipmentStatusText}>{shipment.status}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noShipmentInfo}>
              <Text style={styles.noShipmentText}>
                {statusLower === 'processing' 
                  ? 'Your order is being prepared for shipment. Tracking information will be available soon.'
                  : 'Shipment information is being updated. Please check back later.'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPaymentDetails = () => {
    if (!order?.payment_details) return null;

    const payment = order.payment_details;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>{payment.payment_method}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount:</Text>
            <Text style={styles.paymentValue}>₱{payment.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status:</Text>
            <View style={[styles.paymentStatusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
              <Text style={styles.paymentStatusText}>{payment.status}</Text>
            </View>
          </View>
          {payment.transaction_id && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Transaction ID:</Text>
              <Text style={styles.paymentValueSmall}>{payment.transaction_id}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderOrderItems = () => {
    if (!order?.items || order.items.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product_snapshot.name}
              </Text>
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemLabel}>Price:</Text>
                <Text style={styles.itemValue}>₱{item.product_snapshot.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemLabel}>Quantity:</Text>
                <Text style={styles.itemValue}>{item.quantity}</Text>
              </View>
              <View style={[styles.itemDetailRow, styles.itemSubtotalRow]}>
                <Text style={styles.itemSubtotalLabel}>Subtotal:</Text>
                <Text style={styles.itemSubtotalValue}>
                  ₱{(item.product_snapshot.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (!order) return null;

    const latestStatus = getLatestStatus();
    const orderDate = new Date(order.created_at || latestStatus.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID:</Text>
            <Text style={styles.summaryValue}>#{order._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Date:</Text>
            <Text style={styles.summaryValue}>{formattedDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(latestStatus.status) }]}>
              <Text style={styles.statusBadgeText}>{latestStatus.status}</Text>
            </View>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₱{order.order_total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCancelModal = () => (
    <Modal
      visible={showCancelModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cancel Order?</Text>
          <Text style={styles.modalText}>
            Are you sure you want to cancel this order? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => setShowCancelModal(false)}
              disabled={cancelMutation.isPending}
            >
              <Text style={styles.modalButtonSecondaryText}>Keep Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButtonPrimary, cancelMutation.isPending && styles.modalButtonDisabled]}
              onPress={confirmCancelOrder}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonPrimaryText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load order details</Text>
          <Text style={styles.errorSubText}>{error?.message || 'Please try again'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const latestStatus = getLatestStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOrderSummary()}
        {renderStatusTimeline()}
        {renderOrderItems()}
        {renderShippingInfo()}
        {renderShipmentDetails()}
        {renderPaymentDetails()}

        <View style={styles.actionSection}>
          {latestStatus.status.toLowerCase() === 'delivered' && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}
          {latestStatus.status.toLowerCase() === 'shipped' && (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Track Package</Text>
            </TouchableOpacity>
          )}
          {(latestStatus.status.toLowerCase() === 'pending' || 
            latestStatus.status.toLowerCase() === 'unpaid') && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.secondaryButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {renderCancelModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  timelineStatusActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemDetails: {
    gap: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 13,
    color: '#666',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  itemSubtotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  itemSubtotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemSubtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  addressRow: {
    flexDirection: 'row',
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  shipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  shipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shipmentLabel: {
    fontSize: 13,
    color: '#666',
  },
  shipmentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  shipmentValuePending: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  shipmentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shipmentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  noShipmentInfo: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  noShipmentText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#666',
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  paymentValueSmall: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  actionSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  secondaryButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});

export default OrderDetails;