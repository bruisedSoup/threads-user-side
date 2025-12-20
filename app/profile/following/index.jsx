import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import BackIcon from '../backicon';
import CartIcon from '../wishlist/carticon';
import FollowingsIcon from '../wishlisticon/followingsicon.jsx';
import useUserStore from '../../stores/userStore.js';
import { Buffer } from 'buffer';

const API_BASE_URL = process.env.EXPO_API_URL || 'http://10.0.2.2:3000/api';

const fetchUserFollowing = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  const data = await response.json();
  return data.user.following_seller_ids || [];
};

const fetchSeller = async (sellerId) => {
  const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch seller');
  }
  const data = await response.json();
  return data.seller;
};

const fetchSellerProducts = async (sellerId) => {
  const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/products?limit=4&status=active`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.products || [];
};

const fetchFollowingData = async (userId) => {
  const followingSellerIds = await fetchUserFollowing(userId);
  
  if (followingSellerIds.length === 0) {
    return [];
  }

  const followingPromises = followingSellerIds.map(async (sellerId) => {
    try {
      const [seller, products] = await Promise.all([
        fetchSeller(sellerId),
        fetchSellerProducts(sellerId)
      ]);

      return {
        shopName: seller.store_name,
        products: products,
        seller: seller
      };
    } catch (error) {
      console.error(`Error fetching seller ${sellerId}:`, error);
      return null;
    }
  });

  const results = await Promise.all(followingPromises);
  return results.filter(item => item !== null);
};

const Following = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const userId = user?._id;

  const { data: followingData = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => fetchFollowingData(userId),
    enabled: !!userId,
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleCartPress = () => {
    router.push('/tabs/cart');
  };

  const handleShopPress = (sellerId) => {
    router.push({
      pathname: '../../seller store/StoreDetails',
      params: { sellerId: sellerId }
    });
  };

  const handleProductPress = (productId) => {
    router.push({
      pathname: '../../productDetails/ProductDetails',
      params: { id: productId }
    });
  };

  const convertImageToUri = (imageData) => {
    if (!imageData || !imageData.data) return null;
    
    try {
      const base64String = Buffer.from(imageData.data).toString('base64');
      return `data:${imageData.mimetype};base64,${base64String}`;
    } catch (error) {
      console.error('Error converting image:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <BackIcon width={30} height={30} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Following</Text>
          
          <TouchableOpacity 
            style={styles.cartButton} 
            onPress={handleCartPress}
            activeOpacity={0.7}
          >
            <CartIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <BackIcon width={30} height={30} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Following</Text>
          
          <TouchableOpacity 
            style={styles.cartButton} 
            onPress={handleCartPress}
            activeOpacity={0.7}
          >
            <CartIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error?.message || 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (followingData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <BackIcon width={30} height={30} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Following</Text>
          
          <TouchableOpacity 
            style={styles.cartButton} 
            onPress={handleCartPress}
            activeOpacity={0.7}
          >
            <CartIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>You&apos;re not following any shops yet</Text>
          <Text style={styles.emptySubtext}>Start exploring and follow your favorite sellers!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BackIcon width={30} height={30} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Following</Text>
        
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={handleCartPress}
          activeOpacity={0.7}
        >
          <CartIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {followingData.map((shop) => (
          <View key={shop.seller._id} style={styles.shopContainer}>
            <TouchableOpacity 
              style={styles.shopHeader}
              onPress={() => handleShopPress(shop.seller._id)}
              activeOpacity={0.7}
            >
              <FollowingsIcon width={24} height={24} />
              <Text style={styles.shopName}>{shop.shopName}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.productsGrid}>
              {shop.products.length > 0 ? (
                shop.products.slice(0, 4).map((product) => {
                  const imageUri = product.product_images?.[0] 
                    ? convertImageToUri(product.product_images[0])
                    : null;

                  return (
                    <TouchableOpacity 
                      key={product._id} 
                      style={styles.productCard}
                      onPress={() => handleProductPress(product._id)}
                      activeOpacity={0.7}
                    >
                      {imageUri ? (
                        <Image 
                          source={{ uri: imageUri }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                      )}
                      <View style={styles.productInfo}>
                        <Text style={styles.productPrice} numberOfLines={1}>
                          ₱{product.price.toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noProductsContainer}>
                  <Text style={styles.noProductsText}>No products available</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 47,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButton: {
    position: 'absolute',
    right: 16,
    top: 50,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  shopContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingVertical: 12,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shopName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  chevron: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  productsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  productCard: {
    width: '23%',
    aspectRatio: 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  productImage: {
    width: '100%',
    height: '80%',
  },
  productInfo: {
    padding: 4,
    height: '20%',
    justifyContent: 'center',
  },
  productPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  placeholderImage: {
    width: '100%',
    height: '80%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 16,
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
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noProductsText: {
    fontSize: 12,
    color: '#999',
  },
});

export default Following;