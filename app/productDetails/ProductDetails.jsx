import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Heart, ChevronLeft, Minus, Plus, ShoppingCart, UserPlus, UserCheck, MessageSquare } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import HorizontalLine from '../components/HorizontalLine';
import useIconStore from '../stores/iconStore';
import CustomButton from '../components/CustomButton';
import useCartStore from '../stores/cartStore';
import useUserStore from '../stores/userStore';
import CircledIcon from '../components/CircledIcon';
import ReviewModal from '../components/ReviewModal';
import ReviewItem from '../components/ReviewItem';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

const fetchProductById = async (productId) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const response = await fetch(`${apiUrl}/products/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  const data = await response.json();
  return data.product;
};

const fetchProductReviews = async (productId) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const response = await fetch(`${apiUrl}/reviews?product_id=${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  const data = await response.json();
  return data.reviews;
};

const submitReview = async ({ productId, userId, rating, comment }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const response = await fetch(`${apiUrl}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      product_id: productId,
      rating,
      comment,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit review');
  }
  
  return response.json();
};

const toggleFollowSeller = async ({ userId, sellerId, isFollowing }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
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

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [readMore, setReadMore] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [isFollowingSeller, setIsFollowingSeller] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const sizes = ["S", "M", "L", "XL"];
  const router = useRouter();
  const { favorites, addFavorite, removeFavorite } = useIconStore();
  const isFavorite = favorites.some((p) => String(p.id) === String(id));
  const { chosenSize, addSize, removeSize } = useIconStore();
  const queryClient = useQueryClient();
  const { addToCart } = useCartStore();
  const { user, refreshUser } = useUserStore();

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchProductReviews(id),
    enabled: !!id,
  });

  // Check if user is following this seller
  useEffect(() => {
    if (user && productData?.seller_id?._id) {
      const isFollowing = user.following_seller_ids?.includes(productData.seller_id._id) || false;
      setIsFollowingSeller(isFollowing);
    }
  }, [user, productData]);

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', id]);
      queryClient.invalidateQueries(['product', id]);
      Alert.alert('Success', 'Your review has been submitted!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const followMutation = useMutation({
    mutationFn: toggleFollowSeller,
    onSuccess: async (data) => {
      setIsFollowingSeller(!isFollowingSeller);
      await refreshUser();
      Alert.alert('Success', isFollowingSeller ? 'Unfollowed store' : 'Following store');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !productData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error loading product</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Process all product images
  const productImages = [];
  if (productData.product_images && productData.product_images.length > 0) {
    productData.product_images.forEach((img) => {
      try {
        const base64String = Buffer.from(img.data).toString("base64");
        productImages.push(`data:${img.mimetype};base64,${base64String}`);
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    });
  }

  // If no images, use placeholder
  if (productImages.length === 0) {
    productImages.push(require('../../assets/images/no image.jpg'));
  }

  const product = {
    id: productData._id,
    images: productImages,
    title: productData.name,
    price: productData.price,
    sizePrices: productData.sizePrices || null,
    type: productData.category?.name || '',
    rating: productData.review_summary?.avg_rating || 0,
    reviews: productData.review_summary?.rating_count || 0,
    description: productData.description || '',
    storeName: productData.seller_id?.store_name || '',
    sellerId: productData.seller_id?._id || '',
    quantity: productData.stock_quantity || 0,
  }
  
  const { images, title, price, sizePrices, type, rating, reviews: reviewCount, description, storeName, sellerId } = product;
  
  const parsedSizePrices = sizePrices ? JSON.parse(sizePrices) : null;
  const selectedSize = chosenSize.length > 0 ? chosenSize[chosenSize.length - 1] : "M";
  const sizePrice = parsedSizePrices && parsedSizePrices[selectedSize] ? Number(parsedSizePrices[selectedSize]) : Number(price);
  const totalPrice = sizePrice * quantity;

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(id);
    } else {
      addFavorite({ id, image: images[0], title, price, type, rating, reviews: reviewCount, description });
    }
  };

  const toggleSize = (size) => {
    if (chosenSize.includes(size)) {
      removeSize(size);
    } else {
      chosenSize.forEach(removeSize);
      addSize(size);
    }
  };

  const goToStore = () => {
    router.push({
      pathname: '../seller store/StoreDetails',
      params: { sellerId },
    });
  };

  const handleAddToCart = () => {
    addToCart(storeName, {
      id,
      image: images[0],
      title,
      price: sizePrice,
      size: selectedSize,
      sizePrices,
      type,
      rating,
      reviews: reviewCount,
      description,
      quantity,
    });
  };

  const handleReviewSubmit = ({ rating, comment }) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to submit a review');
      return;
    }
    reviewMutation.mutate({
      productId: id,
      userId: user._id,
      rating,
      comment,
    });
  };

  const handleFollowStore = () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to follow stores');
      return;
    }
    followMutation.mutate({
      userId: user._id,
      sellerId,
      isFollowing: isFollowingSeller,
    });
  };

  const handleScroll = (event) => {
    const slideSize = width - 50;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="black" />
          </TouchableOpacity>
          
          {/* Image Slider */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.imageSlider}
          >
            {images.map((image, index) => (
              <Image 
                key={index} 
                source={typeof image === 'string' ? { uri: image } : image} 
                style={styles.image} 
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          )}
          
          <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
            <Heart size={25} color="black" fill={isFavorite ? "black" : "white"} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.ratingAndReviewsContainer}>
              <Star size={20} color="#FFD700" fill={"#FFD700"} />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({reviewCount} reviews)</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {readMore ? description : `${description.substring(0, 100)}...`}
              <Text style={styles.readMore} onPress={() => setReadMore(!readMore)}>
                {readMore ? " Show Less" : " Read More"}
              </Text>
            </Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <CircledIcon 
                icon={Minus} 
                color="black" 
                size={15} 
                padding={10} 
                onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} 
              />
              <TextInput
                style={styles.quantity}
                value={String(quantity)}
                onChangeText={(text) => setQuantity(Number(text) || 1)}
                keyboardType="numeric"
              />
              <CircledIcon 
                icon={Plus} 
                color="black" 
                size={15} 
                padding={10} 
                onPress={() => setQuantity(quantity + 1)} 
              />
            </View>
          </View>

          <HorizontalLine marginTop={20} />

          <View style={styles.sizeAndColorContainer}>
            <View style={styles.sizeContainer}>
              <Text style={styles.chooseText}>Choose Size</Text>
              <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                {sizes.map((size, index) => {
                  const selected = chosenSize.includes(size);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.sizeButton, { backgroundColor: selected ? 'black' : null }]}
                      onPress={() => toggleSize(size)}
                    >
                      <Text style={selected ? { color: 'white' } : { color: 'black' }}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <HorizontalLine marginTop={20} />

          <View style={styles.storeSection}>
            <View style={styles.storeHeader}>
              <TouchableOpacity onPress={goToStore}>
                <Text style={styles.storeText}>Sold by: {storeName}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.followButton, isFollowingSeller && styles.followingButton]}
                onPress={handleFollowStore}
                disabled={!user}
              >
                {isFollowingSeller ? (
                  <UserCheck size={18} color="white" />
                ) : (
                  <UserPlus size={18} color="white" />
                )}
                <Text style={styles.followButtonText}>
                  {isFollowingSeller ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <HorizontalLine marginTop={20} />

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View>
                <Text style={styles.reviewsTitle}>Customer Reviews</Text>
                <Text style={styles.reviewsSubtitle}>{reviewCount} reviews</Text>
              </View>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={() => setReviewModalVisible(true)}
                disabled={!user}
              >
                <MessageSquare size={18} color="white" />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {reviewsLoading ? (
              <Text style={styles.loadingText}>Loading reviews...</Text>
            ) : reviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Be the first to review this product!</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review) => (
                  <ReviewItem key={review._id} review={review} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View style={styles.fixedAddToCart}>
        <CustomButton
          name={`Add to Cart | Php${totalPrice.toFixed(2)}`}
          icon={ShoppingCart}
          size={22}
          iconColor="#fff"
          containerStyle={styles.addToCartButton}
          textStyle={{ color: "white", fontSize: 16, fontWeight: "bold" }}
          onPress={() => {
            handleAddToCart();
            router.push({
              pathname: '/tabs/cart',
              params: { from: 'productDetails' },
            });
          }}
        />
      </View>

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        productName={title}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },

  imageContainer: {
    paddingHorizontal: 25,
    position: 'relative',
  },

  imageSlider: {
    height: 470,
  },

  image: {
    width: width - 50,
    height: 470,
    borderRadius: 20,
    marginRight: 0,
  },

  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },

  activeIndicator: {
    backgroundColor: 'white',
    width: 24,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#E9EAEC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    left: 40,
    backgroundColor: 'white',
    zIndex: 2,
  },

  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#E9EAEC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    right: 40,
    backgroundColor: 'white',
    zIndex: 2,
  },

  infoContainer: {
    paddingHorizontal: 25,
    marginTop: 20,
  },

  titleSection: {
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  ratingAndReviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    fontSize: 16,
    marginLeft: 10,
    color: '#7B7979',
  },

  reviews: {
    fontSize: 15,
    marginLeft: 5,
    color: '#347CF5',
  },

  quantitySection: {
    marginTop: 20,
  },

  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantity: {
    fontSize: 20,
    marginHorizontal: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 40,
  },

  descriptionContainer: {
    marginTop: 5,
  },

  description: {
    fontSize: 16,
    color: '#7B7979',
    lineHeight: 24,
  },

  readMore: {
    color: 'black',
    fontWeight: 'bold',
  },

  sizeAndColorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  sizeContainer: {
    flex: 1,
  },

  chooseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  sizeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  storeSection: {
    marginTop: 20,
  },

  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  storeText: {
    fontSize: 16,
    color: '#347CF5',
    fontWeight: '600',
  },

  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },

  followingButton: {
    backgroundColor: '#4CAF50',
  },

  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  reviewsSection: {
    marginTop: 20,
  },

  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  reviewsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5,
  },

  writeReviewText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  reviewsList: {
    gap: 15,
  },

  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 20,
  },

  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  noReviewsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },

  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#000000ff',
    borderRadius: 30,
    padding: 20,
    width: '100%',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fixedAddToCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
});

export default ProductDetails;