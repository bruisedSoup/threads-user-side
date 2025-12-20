import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, MapPin, Phone, Package, UserCheck, UserPlus } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import useUserStore from '../stores/userStore';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

const fetchSeller = async (sellerId) => {
  const apiUrl = process.env.EXPO_API_URL || "http://10.0.2.2:3000/api";
  const response = await fetch(`${apiUrl}/sellers/${sellerId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch seller');
  }
  
  const data = await response.json();
  
  if (!data.success || !data.seller) {
    throw new Error('Invalid seller data received');
  }
  
  return data.seller;
};

const fetchSellerProducts = async (sellerId, page = 1, limit = 20) => {
  const apiUrl = process.env.EXPO_API_URL || "http://10.0.2.2:3000/api";
  const response = await fetch(`${apiUrl}/sellers/${sellerId}/products?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data;
};

const toggleFollowSeller = async ({ userId, sellerId, isFollowing }) => {
  const apiUrl = process.env.EXPO_API_URL || "http://10.0.2.2:3000/api";
  const url = isFollowing 
    ? `${apiUrl}/users/${userId}/follow/${sellerId}`
    : `${apiUrl}/users/${userId}/follow`;
  
  const response = await fetch(url, {
    method: isFollowing ? 'DELETE' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: isFollowing ? undefined : JSON.stringify({ seller_id: sellerId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to follow/unfollow seller');
  }
  
  return response.json();
};

const StoreDetails = () => {
  const { sellerId } = useLocalSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useUserStore();
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const queryClient = useQueryClient();

  const { data: sellerData, isLoading: sellerLoading, isError: sellerError } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => fetchSeller(sellerId),
    enabled: !!sellerId,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['sellerProducts', sellerData?._id],
    queryFn: () => fetchSellerProducts(sellerData?._id),
    enabled: !!sellerData?._id,
  });

  useEffect(() => {
    if (user && sellerData?._id) {
      const isFollowing = user.following_seller_ids?.includes(sellerData._id) || false;
      setIsFollowingSeller(isFollowing);
    }
  }, [user, sellerData]);

  const followMutation = useMutation({
    mutationFn: toggleFollowSeller,
    onSuccess: async () => {
      setIsFollowingSeller(!isFollowingSeller);
      await refreshUser();
      Alert.alert('Success', isFollowingSeller ? 'Unfollowed store' : 'Following store');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleFollowStore = () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to follow stores');
      return;
    }
    followMutation.mutate({
      userId: user._id,
      sellerId: sellerData._id,
      isFollowing: isFollowingSeller,
    });
  };

  const handleProductPress = (productId) => {
    router.push({
      pathname: '../productDetails/ProductDetails',
      params: { id: productId },
    });
  };

  if (sellerLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sellerError || !sellerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Error loading store</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Process store cover photo
  let storeCoverImage = null;
  if (sellerData.store_cover_photo?.data) {
    try {
      const base64String = Buffer.from(sellerData.store_cover_photo.data).toString("base64");
      storeCoverImage = { uri: `data:${sellerData.store_cover_photo.mimetype};base64,${base64String}` };
    } catch (error) {
      console.error('Error converting cover photo:', error);
    }
  }

  // Process store profile photo
  let storeProfileImage = null;
  if (sellerData.store_profile_photo?.data) {
    try {
      const base64String = Buffer.from(sellerData.store_profile_photo.data).toString("base64");
      storeProfileImage = { uri: `data:${sellerData.store_profile_photo.mimetype};base64,${base64String}` };
    } catch (error) {
      console.error('Error converting profile photo:', error);
    }
  }

  const products = productsData?.products || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="black" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Store Banner */}
        <View style={styles.bannerContainer}>
          {storeCoverImage ? (
            <Image source={storeCoverImage} style={styles.storeBanner} />
          ) : (
            <View style={styles.storeBanner}>
              <Text style={styles.storeBannerText}>{sellerData.store_name}</Text>
            </View>
          )}
        </View>

        {/* Store Info */}
        <View style={styles.storeInfoContainer}>
          <View style={styles.storeNameSection}>
            {storeProfileImage && (
              <Image source={storeProfileImage} style={styles.storeProfileImage} />
            )}
            <View style={styles.storeNameContent}>
              <Text style={styles.storeName}>{sellerData.store_name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>
                  {sellerData.rating_summary?.avg_rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.ratingCount}>
                  ({sellerData.rating_summary?.rating_count || 0} ratings)
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.storeDescription}>{sellerData.store_description}</Text>

          {/* Store Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Package size={20} color="#666" />
              <Text style={styles.statValue}>{sellerData.rating_summary?.num_products || 0}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Star size={20} color="#FFD700" fill="#FFD700" />
              <Text style={styles.statValue}>
                {sellerData.rating_summary?.avg_rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: 20 }]}>📦</Text>
              <Text style={styles.statValue}>{sellerData.rating_summary?.rating_count || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <MapPin size={18} color="#666" />
              <Text style={styles.contactText}>{sellerData.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={18} color="#666" />
              <Text style={styles.contactText}>{sellerData.contact_number}</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity 
            style={[styles.followButton, isFollowingSeller && styles.followingButton]}
            onPress={handleFollowStore}
            disabled={!user || followMutation.isPending}
          >
            {isFollowingSeller ? (
              <UserCheck size={20} color="white" />
            ) : (
              <UserPlus size={20} color="white" />
            )}
            <Text style={styles.followButtonText}>
              {isFollowingSeller ? 'Following' : 'Follow Store'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>Products</Text>
          
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText}>No products available</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => {
                // Process product image
                let productImage = require('../../assets/images/no image.jpg');
                if (product.product_images && product.product_images.length > 0) {
                  try {
                    const img = product.product_images[0];
                    const base64String = Buffer.from(img.data).toString("base64");
                    productImage = { uri: `data:${img.mimetype};base64,${base64String}` };
                  } catch (error) {
                    console.error('Error converting image:', error);
                  }
                }

                return (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.productCard}
                    onPress={() => handleProductPress(product._id)}
                  >
                    <Image 
                      source={productImage}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>₱{Number(product.price).toFixed(2)}</Text>
                      <View style={styles.productRating}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.productRatingText}>
                          {product.review_summary?.avg_rating?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={styles.productReviewCount}>
                          ({product.review_summary?.rating_count || 0})
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  storeBanner: {
    height: 150,
    backgroundColor: '#000',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  storeBannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  storeInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  storeNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  storeProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },

  storeNameContent: {
    flex: 1,
  },

  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
    color: '#333',
  },

  ratingCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },

  storeDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },

  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },

  contactContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },

  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },

  followingButton: {
    backgroundColor: '#4CAF50',
  },

  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  productsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },

  productsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: (width - 50) / 2,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },

  productInfo: {
    padding: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    height: 35,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },

  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productRatingText: {
    fontSize: 12,
    marginLeft: 3,
    color: '#666',
  },

  productReviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 3,
  },

  noProductsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noProductsText: {
    fontSize: 16,
    color: '#666',
  },
});

export default StoreDetails;