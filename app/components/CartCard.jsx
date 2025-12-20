import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native'
import { Ellipsis, Plus, Minus } from 'lucide-react-native';
import CircledIcon from './CircledIcon';
import CheckIcon from './checkicon';
import useSelectionStore from '../stores/useSelectionStore';
import useCartStore from '../stores/cartStore';
import React, { useState } from 'react'

const CartCard = ({
  id,
  image,
  title,
  price,
  type,
  quantity: initialQuantity
}) => {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const { selectedProducts, selectProduct } = useSelectionStore();
  const isSelected = selectedProducts.includes(id);
  const { updateQuantity, removeFromCart } = useCartStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    updateQuantity(id, newQuantity);
  };

  return (
    <View style={styles.cartContainer}>
        <TouchableOpacity
            style={styles.selectButtonWrapper}
            onPress={() => selectProduct(id)}
        >
          {isSelected ? (
            <CheckIcon width={24} height={24} />
          ) : (
            <View style={styles.uncheckedCircle} />
          )}
        </TouchableOpacity>
        
        <View style={styles.imageContainer}>
            <Image source={{uri:image}} style={styles.image} />
        </View>
        
        <View style={styles.productInfoContainer}>
            <View style={styles.productTitleContainer}>
                <Text style={styles.productTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                  <Ellipsis size={20} color="#000000ff" strokeWidth={1} />
                </TouchableOpacity>
                 {isEditing === true && (
                  <View>
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                 )}
            </View>
            <Text style={styles.productType}>{type}</Text>
            <View style={styles.priceQuantityContainer}>
                <Text style={styles.productPrice}>Php {price}</Text>
                <View style={styles.quantityContainer}>
                    <CircledIcon 
                      icon={Minus} 
                      color="black" 
                      size={15} 
                      padding={10} 
                      onPress={() => {
                        if (quantity > 1) {
                          handleQuantityChange(quantity - 1);
                        }
                      }}
                    />
                    <TextInput 
                      style={styles.quantity} 
                      value={String(quantity)}
                      onChangeText={(text) => {
                        const num = Number(text);
                        if (!isNaN(num) && num > 0) {
                          handleQuantityChange(num);
                        }
                      }} 
                      keyboardType="numeric" 
                    />
                    <CircledIcon 
                      icon={Plus} 
                      color="black" 
                      size={15} 
                      padding={10} 
                      onPress={() => handleQuantityChange(quantity + 1)}
                    />
                </View>
            </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cartContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectButtonWrapper: {
    marginRight: 7,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#292526',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
    borderRadius: 25,
  },
  productInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  productTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  productType: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 30,
  },

  removeButton: {
    position: 'absolute',
    right: 1,
    bottom: 5,
    padding: 7,
    backgroundColor: '#000000ff',
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
  },

  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
})

export default CartCard