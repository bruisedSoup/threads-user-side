import { create } from 'zustand';

const apiUrl = process.env.EXPO_API_GET_USERS_URL || 'http://10.0.2.2:3000/api/users';

const fetchUserData = async (token, user_id) => {
  const response = await fetch(`${apiUrl}/${user_id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.user; // Return just the user object
  } else {
    throw new Error('Failed to fetch user data');
  }
};

const useUserStore = create((set, get) => ({
  user: null,
  userToken: null,
  
  setUser: async (token, user_id) => {
    try {
      const userData = await fetchUserData(token, user_id);
      set({ 
        user: userData,
        userToken: token 
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },
  
  refreshUser: async () => {
    const state = get(); 
    if (state.user && state.userToken) {
      try {
        const userData = await fetchUserData(state.userToken, state.user._id);
        set({ user: userData });
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  },
  
  clearUser: () => set({ user: null, userToken: null }),
  
  updateUserField: (field, value) => {
    set(state => ({
      user: {
        ...state.user,
        [field]: value
      }
    }));
  }
}));

export default useUserStore;