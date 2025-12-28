import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import useUserStore from '../app/stores/userStore';

const { useFonts, Unna_400Regular, Unna_700Bold } = require('@expo-google-fonts/unna');

const SignInPage = () => {
  const { setUser } = useUserStore();

  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:3000/api";
  const [ registerData, setRegisterData ] = useState(null);
  const [ registerFormData, setRegisterFormData ] = useState({ 
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [ loginFormData, setLoginFormData ] = useState({
    email: "",
    password: "",
  });


    const registerUser = async (formData) => { 
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });
      const data = await response.json(); 
      setRegisterData(data); 
      return data;
    }

  const registerMutation = useMutation({ 
    mutationFn: registerUser, 
    onSuccess: (data) => { 
      console.log('Registration Successful: ', data)
      if (data && data.success) {
        setUser(data.token, data.user.user_id);
        router.replace('/tabs/home');
      }
    },
    onError: (error) => { 
      console.log('Registration error:', error)
    },
  })

  const handleSubmitRegistration = (e) => { 
    e.preventDefault();
    registerMutation.mutate(registerFormData);
  }

  const registerHandleChange = (fieldName, text) => { 
    setRegisterFormData({
      ...registerFormData, 
      [fieldName]: text,
    });
  }

  const loginUser = async (formData) => { 
    const response = await fetch(`${apiUrl}/auth/login`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), 
    });
    
    const data = await response.json();
    return data;
  }
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('Login Successful: ', data)
      if (data && data.success) {
        setUser(data.token, data.user.user_id);
        router.replace('/tabs/home');
      } else if (data.success === 'false') {
        Alert.alert('Login Failed', data.message || 'Invalid email or password.');
      }
    },
    onError: (error) => {
      console.log('Login error:', error)
      Alert.alert('Login Failed', error.message || 'An error occurred during login.');
    },
  })

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginFormData);
  }

  const loginHandleChange = (fieldName, text) => {
    setLoginFormData({
      ...loginFormData,
      [fieldName]: text,
    });
  }

  //Frontend State
  const [activeTab, setActiveTab] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Unna_400Regular,
    Unna_700Bold,
  });

  if(!fontsLoaded) {
    return <Text>Loading...</Text>
  }

  const handleSwitchToSignIn = () => {
    setActiveTab("signIn");
    setEmail("");
    setPassword("");
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, styles.unnaFontBold]}>THREADS</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === "signIn" && styles.activeTab]} 
          onPress={() => { setActiveTab("signIn"); setEmail(""); setPassword(""); }}>
            <Text style={[styles.tabText, activeTab === "signIn" && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, activeTab === "register" && styles.activeTab]} 
          onPress={() => { setActiveTab("register"); setEmail(""); setPassword(""); }}>
            <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {activeTab === "signIn" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#787676"
                value={loginFormData.email}
                onChangeText={(text) => loginHandleChange('email', text)} //Updating the email field using the loginHandleChange function
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#787676"
                secureTextEntry
                value={loginFormData.password}
                onChangeText={(text) => loginHandleChange('password', text)}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#787676"
                value={registerFormData.first_name}
                onChangeText={(text) => registerHandleChange('first_name', text)} //Updating the first name field using the registerHandleChange function
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#787676"
                value={registerFormData.last_name}
                onChangeText={(text) => registerHandleChange('last_name', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Create Username"
                placeholderTextColor="#787676"
                value={registerFormData.username}
                onChangeText={(text) => registerHandleChange('username', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#787676"
                value={registerFormData.email}
                onChangeText={(text) => registerHandleChange('email', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Create Password"
                placeholderTextColor="#787676"
                secureTextEntry
                value={registerFormData.password}
                onChangeText={(text) => registerHandleChange('password', text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#787676"
                secureTextEntry
                value={registerFormData.confirm_password}
                onChangeText={(text) => registerHandleChange('confirm_password', text)}
              />
            </>
          )}
        </View>
          
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={activeTab === "signIn" ? handleSubmitLogin : handleSubmitRegistration}>
            <Text style={styles.buttonText}>{activeTab === "signIn" ? "Sign In" : "Sign Up"}</Text>
          </TouchableOpacity>

          {activeTab === "register" && (
            <View style={styles.accountTextContainer}>
              <Text style={styles.accountText}>
                Already have an account?{' '}
                <Text style={styles.signInLink} onPress={() => setActiveTab("signIn")}>
                  Sign In
                </Text>
              </Text>
            </View>
          )}

          <Text style={styles.orText}>
            {activeTab === "signIn" ? "or join with" : null}
          </Text>

          {activeTab === "signIn" && (
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require('../assets/images/facebook.png')} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image source={require('../assets/images/instagram.png')} style={styles.socialIcon} />
              </TouchableOpacity>
            </View>
          )}

        </View>

      </View>
    </SafeAreaView>
  );
}

export default SignInPage

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "white",
  },

  container: {
    backgroundColor: "white",
    flex: 1
  },

  header: {
    height: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

  headerText: {
    color: "black",
    fontSize: 32,
  },

  unnaFontBold: {
    fontFamily: "Unna_700Bold",
  },

  unnaFontRegular:{
    fontFamily: "Unna_400Regular",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },

  tab:{
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },

  tabText: {
    color: "#999",
    fontSize: 25,
    padding: 8,
    fontFamily: "Unna_400Regular",
    alignItems: "center",
    letterSpacing: 0.5,
  },

  activeTab: {
    
  },

  activeTabText: {
    color: "black",
    borderBottomWidth: 3,
    borderBottomColor: "black",
    fontFamily: "Unna_700Bold",
  },

  formContainer: {
    paddingHorizontal: 30,
    marginTop: 15,
  },

  input:{
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    fontFamily: "Unna_400Regular",
    fontSize: 20,
    letterSpacing: 0.5,
    paddingVertical: 12,
  },

  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },

  button: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 80,
    margin: 10,
    letterSpacing: 0.5,
    borderRadius: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 25,
    fontFamily: "Unna_700Bold",
    textAlign: 'center',
  },

  accountTextContainer: {
    marginTop: 10,
    marginBottom: 10,
  },

  accountText: {
    color: "#999",
    fontSize: 18,
    fontFamily: "Unna_400Regular",
    letterSpacing: 0.5,
  },

  signInLink: {
    color: "black",
    textDecorationLine: 'underline',
    fontFamily: "Unna_700Bold",
  },

  orText: {
    color: "#999",
    fontSize: 18,
    fontFamily: "Unna_400Regular",
    margin: 10,
    letterSpacing: 0.5,
  },

  socialButtonsContainer: {
    flexDirection: "row",
    margin: 10,
  },

  socialButton: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    marginHorizontal: 8,
  },

  socialIcon: {
    width: 30,
    height: 30,
  },
})
