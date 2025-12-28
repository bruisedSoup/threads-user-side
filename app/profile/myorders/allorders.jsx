import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackIcon from '../backicon';
import CustomSearchBar from '../../components/CustomSearch';
import EmptyIcon from '../../components/empty';
import StoreIcon from '../../components/storeicon';
import { useQuery } from '@tanstack/react-query';
import useUserStore from '../../stores/userStore';

const fetchOrders = async (user_id) => {
  const apiUrl = process.env.EXPO_API_ORDERS_URL || 'http://192.168.1.2:3000/api/orders/getAllOrders';
  const response = await fetch(`${apiUrl}/${user_id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders;
};

const AllOrders = () => {
  const { initialTab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab || 'All orders');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { user } = useUserStore();
  const user_id = user ? user._id : null;

  const handleBackPress = () => router.back();

  const tabs = [
    { key: 'All orders', label: 'All orders' },
    { key: 'Unpaid', label: 'Unpaid' },
    { key: 'Cancelled', label: 'Cancelled' },
    { key: 'Processing', label: 'Processing' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Review', label: 'Review' },
  ];

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders', user_id],
    queryFn: () => fetchOrders(user_id),
  });

  const getLatestStatus = (order) => {
    if (order.status_history && order.status_history.length > 0) {
      return order.status_history[order.status_history.length - 1].status;
    }
    return 'Unknown';
  };

const filterOrdersByStatus = (orders, status) => {
  if (status === 'All orders') return orders;
  
  if (status === 'Unpaid') {
    return orders.filter(order => {
      const latestStatus = getLatestStatus(order);
      const paymentMethod = order.payment_details?.payment_method?.toLowerCase();
      const paymentStatus = order.payment_details?.status?.toLowerCase();
      
      if (latestStatus.toLowerCase() === 'unpaid') {
        return true;
      }
      
      if (latestStatus.toLowerCase() === 'pending') {
        const isNotCOD = paymentMethod && paymentMethod !== 'cod' && paymentMethod !== 'cash on delivery';
        const isUnpaid = paymentStatus && (paymentStatus === 'pending' || paymentStatus === 'unpaid');
        return isNotCOD && isUnpaid;
      }
      
      return false;
    });
  }
  
  return orders.filter(order => {
    const latestStatus = getLatestStatus(order);
    return latestStatus.toLowerCase() === status.toLowerCase();
  });
};

  const filterOrdersBySearch = (orders) => {
    if (!searchQuery.trim()) return orders;
    return orders.filter(order => 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => 
        item.product_snapshot.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filteredOrders = filterOrdersBySearch(filterOrdersByStatus(orders, activeTab));

  const renderOrderCard = (order) => {
    const latestStatus = getLatestStatus(order);
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
        {/* Status Badge */}
        <View style={latestStatus.toLowerCase() === 'unpaid' ? styles.unpaidBadge 
                    : latestStatus.toLowerCase() === 'processing' ? styles.processingBadge 
                    : latestStatus.toLowerCase() === 'shipped' ? styles.shippedBadge 
                    : latestStatus.toLowerCase() === 'pending' ? styles.pendingBadge
                    : latestStatus.toLowerCase() === 'cancelled' ? styles.cancelledBadge
                    : styles.statusBadge}>
          <Text style={styles.statusText}>{latestStatus}
          </Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderIdText}>Order #{order._id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {order.items.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product_snapshot.name}
                </Text>
                <Text style={styles.itemDetails}>
                  Qty: {item.quantity} × ₱{item.product_snapshot.price.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          {order.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 3} more item(s)
            </Text>
          )}
        </View>

        {/* Order Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₱{order.order_total.toFixed(2)}</Text>
        </View>

        {/* Shipping Info */}
        {order.shipping_address_snapshot && (
          <View style={styles.shippingInfo}>
            <StoreIcon width={16} height={16} style={styles.locationIcon} />
            <Text style={styles.shippingText} numberOfLines={1}>
              {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.province}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {latestStatus.toLowerCase() === 'delivered' && (
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
          {latestStatus.toLowerCase() === 'shipped' && order.shipment_details?.tracking_number && (
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Package</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderContent = () => {
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
          <Text style={styles.errorSubText}>{error?.message}</Text>
        </View>
      );
    }

    if (filteredOrders.length === 0) {
      return renderEmptyBlock();
    }

    return (
      <View style={styles.ordersContent}>
        {filteredOrders.map(order => renderOrderCard(order))}
      </View>
    );
  };

  const renderEmptyBlock = () => (
    <View style={styles.ordersContent}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyContainer}>
          <EmptyIcon style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!user_id) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to view orders</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomSearchBar 
          placeholder="Search orders by ID or product name" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab, idx) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                idx !== tabs.length - 1 ? styles.tabMargin : null,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOrderContent()}
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
    textAlign: 'center',
    color: '#1a1a1a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabsContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 14,
    position: 'relative',
    minWidth: 80,
    alignItems: 'center',
  },
  tabMargin: {
    marginRight: 20,
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  ordersContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  processingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  shippedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#69c66fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  unpaidBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  cancelledBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#c0392b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffffff',
    textTransform: 'capitalize',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    marginRight: 6,
  },
  shippingText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  trackButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
  },
  suggestions: {
    marginTop: 24,
  },
});

export default AllOrders;