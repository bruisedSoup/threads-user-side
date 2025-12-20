import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../backicon';
import EmptyIcon from '../../components/empty';
import StoreIcon from '../../components/storeicon';
import ProductSuggestions from '../../components/ProductSuggestions';
import { useQuery } from '@tanstack/react-query';
import useUserStore from '../../stores/userStore';

const fetchOrders = async (user_id) => {
  const apiUrl = process.env.EXPO_API_ORDERS_URL || 'http://10.0.2.2:3000/api/orders/getAllOrders';
  const response = await fetch(`${apiUrl}/${user_id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders;
};

const OrderStatusScreen = ({ status, title }) => {
  const router = useRouter();
  const { user } = useUserStore();
  const user_id = user ? user._id : null;

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['orders', user_id],
    queryFn: () => fetchOrders(user_id),
    enabled: !!user_id,
  });

  const handleBackPress = () => router.back();

  // Get the latest status from status_history
  const getLatestStatus = (order) => {
    if (order.status_history && order.status_history.length > 0) {
      return order.status_history[order.status_history.length - 1].status;
    }
    return 'Unknown';
  };

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    const latestStatus = getLatestStatus(order);
    return latestStatus.toLowerCase() === status.toLowerCase();
  });

  // Get products for suggestions
  const productsFlat = orders.flatMap(order =>
    order.items.map(item => ({
      id: item.product_id,
      name: item.product_snapshot.name,
      price: item.product_snapshot.price,
      quantity: item.quantity,
    }))
  );

  const renderOrderCard = (order) => {
    const statusDate = order.status_history?.[order.status_history.length - 1]?.date;
    const formattedDate = statusDate ? new Date(statusDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : '';

    return (
      <TouchableOpacity 
        key={order._id} 
        style={styles.orderCard}
        onPress={() => router.push({ pathname: './OrderDetails', params: { id: order._id } })}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderIdText}>Order #{order._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {order.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product_snapshot.name}
              </Text>
              <Text style={styles.itemDetails}>
                x{item.quantity}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more
            </Text>
          )}
        </View>

        {/* Shipping Info */}
        {order.shipping_address_snapshot && (
          <View style={styles.shippingRow}>
            <StoreIcon width={14} height={14} />
            <Text style={styles.shippingText} numberOfLines={1}>
              {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.province}
            </Text>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₱{order.order_total.toFixed(2)}</Text>
        </View>

        {/* Tracking Info for Shipped Orders */}
        {status.toLowerCase() === 'shipped' && order.shipment_details?.tracking_number && (
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingLabel}>Tracking:</Text>
            <Text style={styles.trackingNumber}>{order.shipment_details.tracking_number}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (!user_id) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Please log in to view orders</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load orders</Text>
        </View>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <EmptyIcon width={80} height={80} />
          <Text style={styles.emptyText}>No {status.toLowerCase()} orders</Text>
          <Text style={styles.emptySubText}>
            Orders with &quot;{status}&quot; status will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.ordersContainer}>
        {filteredOrders.map(order => renderOrderCard(order))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        
        {!isLoading && productsFlat.length > 0 && (
          <ProductSuggestions
            products={productsFlat}
            title="You May Also Like"
            style={styles.suggestions}
          />
        )}
      </ScrollView>
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
  ordersContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemDetails: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  shippingText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  trackingInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  trackingNumber: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  suggestions: {
    marginTop: 24,
  },
});

export default OrderStatusScreen;