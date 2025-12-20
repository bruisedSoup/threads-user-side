import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { useRouter } from 'expo-router'

const WelcomeHeader = (props) => {
  const router = useRouter();

  const handleOnPress = () => {
    router.push('/tabs/profile');
  };

  const profileImage = props.image || props.profile_image;

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View>
        <Text style={styles.greetingText}>Hello, Welcome👋</Text>
        <Text style={styles.userNameText}>{capitalize(props.name)}</Text>
      </View>
      <TouchableOpacity onPress={handleOnPress}>
        <Image 
          source={{ uri: profileImage }} 
          style={styles.profileImage}
          defaultSource={require('../../assets/images/no image.jpg')} 
        />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  greetingText: {
    fontSize: 16,
    color: '#888',
  },

  userNameText: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 65 / 2,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
  }
})

const capitalize = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default WelcomeHeader