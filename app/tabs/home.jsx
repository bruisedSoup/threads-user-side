import { useQuery } from '@tanstack/react-query';
import { LayoutGrid } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Bottoms from '../components/bottomicon';
import CustomButton from '../components/CustomButton';
import DressIcon from '../components/dressicon';
import ProductSuggestions from '../components/ProductSuggestions';
import SearchBar from '../components/SearchBar';
import Shirt from '../components/shirticon';
import Tops from '../components/topsicon';
import WelcomeHeader from '../components/WelcomeHeader';

const fetchProducts = async () => {
  const apiUrl = process.env.EXPO_API_URL || "http://10.0.2.2:3000/api";
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

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    onSuccess: (data) => { console.log('Products fetched successfully:', data); },
    onError: (error) => { console.error('Error fetching products:', error); },
  });

  const filterIcons = [
    { name: "Dress", icon: DressIcon, type: "Dress Modern" },
    { name: "T-Shirt", icon: Shirt, type: "T-Shirt" },
    { name: "Bottoms", icon: Bottoms, type: "Bottoms" },
    { name: "Tops", icon: Tops, type: "Top" }
  ];

  const products = productsData || [];
  const productsFlat = products.map(product => ({
    id: product._id,
    image: product.image ? { uri: product.image } : require('../../assets/images/no image.jpg'),
    title: product.name,
    price: product.price,
    sizePrices: product.sizePrices || {},
    type: product.category?.name || '',
    rating: product.review_summary?.avg_rating || 0,
    reviews: product.review_summary?.rating_count || 0,
    description: product.description || '',
    storeName: product.seller_id?.store_name || '',
    quantity: product.stock_quantity || 0,
  }));

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
      {/* Header */}
      <View style={{ zIndex: 10, backgroundColor: '#fff' }}>
        <WelcomeHeader name="User One" />
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

      {/* Product Section */}
      <View style={styles.productSuggestionsContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
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