import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import SettingsIcon from '../../app/profile/settingsicon.jsx';
import UnpaidIcon from '../../app/profile/myordersicon/unpaidicon.jsx';
import ProcessingIcon from '../../app/profile/myordersicon/processingincon.jsx';
import ShippedIcon from '../../app/profile/myordersicon/shippedicon.jsx';
import ReviewIcon from '../../app/profile/myordersicon/reviewicon.jsx';
import ReturnsIcon from '../../app/profile/myordersicon/returnsicon.jsx';
import WishlistIcon from '../../app/profile/wishlisticon/wishlisticon.jsx';
import FollowingsIcon from '../../app/profile/wishlisticon/followingsicon.jsx';
import ProductSuggestions from '../components/ProductSuggestions';
import useIconStore from '../stores/iconStore';
import useUserStore from '../stores/userStore.js';
import { useQuery } from '@tanstack/react-query';
import { Buffer } from 'buffer';

const fetchProducts = async () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const response = await fetch(`${apiUrl}/products/`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.products;
};

const Profile = () => {
  const router = useRouter();

  const { favorites } = useIconStore();

  const { user }  = useUserStore();

  const followingsCount = user?.following_seller_ids?.length || 0;

  const { 
    data: productsData
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    onSuccess: (data) => { 
      console.log('Products fetched successfully:', data);
    },
    onError: (error) => { 
      console.error('Error fetching products:', error); 
    },
  });

  const handleSettingsPress = () => { router.push('/profile/settings'); };

  // Get profile image - prioritize profile_picture, fallback to profile_image
  const getProfileImage = () => {
    if (user?.profile_picture?.data) {
      try {
        const base64String = Buffer.from(user.profile_picture.data).toString('base64');
        return `data:${user.profile_picture.mimetype};base64,${base64String}`;
      } catch (error) {
        console.error('Error converting profile picture to base64:', error);
      }
    }
    // Fallback to profile_image (DiceBear API)
    return user?.profile_image?.replace('/svg?', '/png?') || null;
  };

  const profileImageUri = getProfileImage();

  const handleAvatarPress = () => {
    router.push({
      pathname: '/profile/userprofile',
      params: { profilePicture: profileImageUri },
    });
  };

  const handleTabPress = route => { router.push(route); };

  const products = productsData || [];
  
  const productsFlat = products.map(product => {
    let imageUri = require('../../assets/images/no image.jpg');

    if (product.product_images && product.product_images[0]) {
      const img = product.product_images[0];
      try {
        const base64String = Buffer.from(img.data).toString("base64");
        imageUri = {
          uri: `data:${img.mimetype};base64,${base64String}`
        };
      } catch (error) {
        console.error('Error converting image to base64:', error);
        imageUri = require('../../assets/images/no image.jpg');
      }
    }
    return {
      id: product._id,
      image: imageUri,
      title: product.name,
      price: product.price,
      sizePrices: product.sizePrices || {},
      type: product.category_id?.map(category => category.name).join(', ') || 'Uncategorized',
      rating: product.review_summary?.avg_rating || 0,
      reviews: product.review_summary?.rating_count || 0,
      description: product.description || '',
      storeName: product.seller_id?.store_name || '',
      quantity: product.stock_quantity || 0,
    };
  });

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
          <SettingsIcon width={27} height={27} />
        </TouchableOpacity>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: profileImageUri }}
              style={styles.avatar}
              defaultSource={require('../../app/profile/static_avatar.jpg')}
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.title}>{`${user?.first_name || 'User'} ${user?.last_name || ''}`}</Text>
            <Text style={styles.prof}>{user?.username || 'username'}</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={false}
        style={styles.scrollView}
      >
        {/* My Orders Section */}
        <View style={styles.myOrders}>
          <View style={styles.ordersContainer}>
            <Text style={styles.myOrdersTitle}>My Orders</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => handleTabPress('/profile/myorders/allorders')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all &gt;</Text>
            </TouchableOpacity>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('/profile/myorders/allorders?initialTab=Unpaid')}
                activeOpacity={0.7}
              >
                <UnpaidIcon width={26} height={26} />
                <Text style={styles.tabText}>Unpaid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('/profile/myorders/allorders?initialTab=Processing')}
                activeOpacity={0.7}
              >
                <ProcessingIcon width={28} height={28} />
                <Text style={styles.tabText}>Processing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('/profile/myorders/allorders?initialTab=Shipped')}
                activeOpacity={0.7}
              >
                <ShippedIcon width={28} height={28} />
                <Text style={styles.tabText}>Shipped</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('/profile/myorders/allorders?initialTab=Review')}
                activeOpacity={0.7}
              >
                <ReviewIcon width={28} height={28} />
                <Text style={styles.tabText}>Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => handleTabPress('/profile/myorders/allorders?initialTab=Returns')}
                activeOpacity={0.7}
              >
                <ReturnsIcon width={26} height={26} />
                <Text style={styles.tabText}>Returns</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wishlist & Followings */}
          <View style={styles.twoColumnsContainer}>
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Wishlist</Text>
              <TouchableOpacity style={styles.columnItem} onPress={() => handleTabPress('/tabs/likes')} activeOpacity={0.7}>
                <WishlistIcon width={24} height={24} />
                <Text style={styles.columnText}>
                  {favorites.length} wishlist
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Followings</Text>
              <TouchableOpacity style={styles.columnItem} onPress={() => handleTabPress('/profile/following')} activeOpacity={0.7}>
                <FollowingsIcon width={24} height={24} />
                <Text style={styles.columnText}>{followingsCount} followings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Product Grid */}
        <ProductSuggestions
          products={productsFlat}
          title="You May Also Like"
          showTitle={false}
          numColumns={2}
          style={{ marginTop: 15 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
    paddingBottom: 60,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    paddingTop: 55,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollView: {
    marginTop: 130,
  },
  settingsButton: {
    position: 'absolute',
    top: 55,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  profileSection: {
    left: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prof: {
    fontSize: 11,
    fontFamily: 'EncodeSans-Regular',
    color: '#666',
  },
  myOrders: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    width: '105%',
    alignSelf: 'center',
    minHeight: 200,
  },
  ordersContainer: {
    marginTop: -10,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
  },
  myOrdersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 15,
  },
  viewAllButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  viewAllText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: -10,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  twoColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 10,
    marginBottom: -10,
  },
  columnContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  columnItem: {
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    width: '100%',
  },
  columnText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default Profile;