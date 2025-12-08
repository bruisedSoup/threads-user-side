import { Tabs } from 'expo-router';
import HomeActive from '../../assets/tabs/homeactive.jsx';
import HomeInactive from '../../assets/tabs/homeinactive.jsx';
import LikesActive from '../../assets/tabs/likesactive.jsx';
import LikesInactive from '../../assets/tabs/likesinactive.jsx';
import CartActive from '../../assets/tabs/addtocartactive.jsx';
import CartInactive from '../../assets/tabs/addtocartinactive.jsx';
import ProfileActive from '../../assets/tabs/profileactive.jsx';
import ProfileInactive from '../../assets/tabs/profileinactive.jsx';
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'white', 
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35, 
          backgroundColor: '#292526',
          borderTopWidth: 0,
          elevation: 5, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          marginHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          paddingVertical: 15,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen 
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            focused ? (
              <HomeActive width={50} height={50} />
            ) : (
              <HomeInactive width={50} height={50} />
            )
          ),
        }}
      />
      
      <Tabs.Screen 
        name="cart" 
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            focused ? (
              <CartActive width={50} height={50} />
            ) : (
              <CartInactive width={50} height={50} />
            )
          ),
        }}
      />

      <Tabs.Screen 
        name="likes" 
        options={{
          title: "Likes",
          tabBarIcon: ({ focused }) => (
            focused ? (
              <LikesActive width={50} height={50} />
            ) : (
              <LikesInactive width={50} height={50} />
            )
          ),
        }}
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            focused ? (
              <ProfileActive width={50} height={50} />
            ) : (
              <ProfileInactive width={50} height={50} />
            )
          ),
        }}
      />
    </Tabs>
  );
}