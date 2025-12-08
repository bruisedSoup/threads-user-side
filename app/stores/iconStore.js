import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useIconStore = create(
  persist((set, get) => ({
    favorites: [],
    addFavorite: (product) => set((state) => ({
      favorites: [...state.favorites, product]
    })),
    removeFavorite: (productId) => set((state) => ({
      favorites: state.favorites.filter((p) => String(p.id) !== String(productId))
    })),
    isFavorite: (productId) => (get) => get().favorites.some((p) => String(p.id) === String(productId)),

    chosenSize: [],
    addSize: (size) => set((state) => ({
      chosenSize: [...state.chosenSize, size]
    })),
    removeSize: (size) => set((state) => ({
      chosenSize: state.chosenSize.filter((s) => s !== size)
    })),
    isSizeChosen: (size) => (get) => get().chosenSize.includes(size),
  }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  ),
  
);

export default useIconStore;