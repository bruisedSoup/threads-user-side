import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, RefreshCw } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Bottoms from '../components/bottomicon';
import CustomButton from '../components/CustomButton';
import DressIcon from '../components/dressicon';
import ProductSuggestions from '../components/ProductSuggestions';
import SearchBar from '../components/SearchBar';
import Shirt from '../components/shirticon';
import Tops from '../components/topsicon';
import WelcomeHeader from '../components/WelcomeHeader';
import { Buffer } from 'buffer';
import useUserStore from '../stores/userStore';

const fetchProducts = async () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const response = await fetch(`${apiUrl}/products/`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.products;
};

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserStore();

  const { 
    data: productsData, 
    refetch, 
    isRefetching 
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onRefresh = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const getProfileImage = () => {
    if (user?.profile_picture?.data) {
      try {
        const base64String = Buffer.from(user.profile_picture.data).toString('base64');
        return `data:${user.profile_picture.mimetype};base64,${base64String}`;
      } catch (error) {
        console.error('Error converting profile picture to base64:', error);
      }
    }
    return user?.profile_image?.replace('/svg?', '/png?') || null;
  };

  const filterIcons = [
    { name: "Dress", icon: DressIcon, type: "Dress" },
    { name: "T-Shirt", icon: Shirt, type: "T-Shirt" },
    { name: "Bottoms", icon: Bottoms, type: "Bottoms" },
    { name: "Tops", icon: Tops, type: "Tops" }
  ];

  const products = productsData || [];
  const productsFlat = products.map(product => {
    let imageUri = require('../../assets/images/no image.jpg');

    if (product.product_images && product.product_images[0]) {
      const img = product.product_images[0];
      try {
        const base64String = Buffer.from(img.data).toString("base64");
        imageUri = {
          uri: `data:${img.mimetype};base64,${base64String}` || null
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

  let filteredProducts =
    selectedFilter === "All Items"
      ? productsFlat
      : productsFlat.filter(product => product.type === selectedFilter);

  if (searchQuery.trim() !== "") {
    filteredProducts = filteredProducts.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.title.toLowerCase().includes(searchLower) ||
        product.type.toLowerCase().includes(searchLower) ||
        product.storeName.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ zIndex: 10, backgroundColor: '#fff' }}>
        <View style={styles.headerRow}>
          <WelcomeHeader 
            name={`${user?.first_name || ""} ${user?.last_name || ""}`} 
            image={getProfileImage()}
          />
        </View>
        <View style={styles.searchBarContainer}>
          <SearchBar 
            placeholder="Search clothes..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabContainer, { zIndex: 10, backgroundColor: '#fff' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
          {/* All Items Button */}
          <CustomButton
            name="All Items"
            icon={LayoutGrid}
            size={30}
            iconColor={selectedFilter === "All Items" ? "#fff" : "#000"}
            onPress={() => setSelectedFilter("All Items")}
            containerStyle={{
              backgroundColor: selectedFilter === "All Items" ? "#000" : "#fff",
              borderRadius: 10,
              marginRight: 10,
              paddingHorizontal: 13,
              paddingVertical: 3,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              borderWidth: 1,
            }}
            textStyle={{ color: selectedFilter === "All Items" ? "#fff" : "#000", fontSize: 17 }}
          />

          {/* Dynamic Filter Buttons */}
          {filterIcons.map((item, index) => (
            <CustomButton
              key={index}
              name={item.name}
              icon={item.icon}
              size={30}
              iconColor={selectedFilter === item.type ? "#fff" : "#000"}
              onPress={() => setSelectedFilter(item.type)}
              containerStyle={{
                backgroundColor: selectedFilter === item.type ? "#000" : "#fff",
                borderRadius: 10,
                marginRight: 10,
                paddingHorizontal: 13,
                paddingVertical: 3,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderWidth: 1,
              }}
              textStyle={{ color: selectedFilter === item.type ? "#fff" : "#000", fontSize: 17 }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Product Section with Pull-to-Refresh */}
      <View style={styles.productSuggestionsContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRefetching}
              onRefresh={onRefresh}
              colors={['#000']}
              tintColor="#000"
              title="Pull to refresh"
              titleColor="#666"
            />
          }
        >
          <ProductSuggestions
            products={filteredProducts}
            numColumns={2}
            showTitle={false}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingBottom: 60,
    marginTop: 5,
  },
  headerRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  refreshButtonContainer: {
    marginBottom: 10,
  },
  searchBarContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
    color: 'black',
  },
  filterTabContainer: {
    paddingHorizontal: 25,
  },
  productSuggestionsContainer: {
    flex: 1,
    paddingHorizontal: 1,
    marginTop: -65,
  },
});