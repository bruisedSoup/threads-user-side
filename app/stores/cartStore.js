import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiUrl = process.env.EXPO_API_GET_CARTS_URL || 'http://192.168.1.2:3000/api/carts';

const syncCartWithBackend = async (cart) => {
  const response = await fetch(`${apiUrl}/${cart.user_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) throw new Error("Failed to sync cart with backend");
};

const loadCartFromBackend = async (user_id) => {
  const response = await fetch(`${apiUrl}/${user_id}`);
  if (!response.ok) throw new Error("Failed to load cart from backend");
  const data = await response.json();
  return data.cart;
};

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addUserIdtoCart: (user_id) =>
        set((state) => ({
          cart: state.cart.map((store) => ({ ...store, user_id })),
        })),

      addToCart: (storeName, product) =>
        set((state) => {
          const stores = JSON.parse(JSON.stringify(state.cart));

          const storeIndex = stores.findIndex(
            (s) => s.storeName === storeName
          );

          if (storeIndex >= 0) {
            const productIndex = stores[storeIndex].products.findIndex(
              (p) => p.id === product.id
            );

            if (productIndex >= 0) {
              stores[storeIndex].products[productIndex].quantity +=
                product.quantity;
            } else {
              stores[storeIndex].products.push(product);
            }
          } else {
            stores.push({
              storeName,
              products: [product],
            });
          }

          return { cart: stores };
        }),

      updateQuantity: (productId, newQuantity) =>
        set((state) => ({
          cart: state.cart.map((store) => ({
            ...store,
            products: store.products.map((p) =>
              p.id === productId ? { ...p, quantity: newQuantity } : p
            ),
          })),
        })),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart
            .map((store) => ({
              ...store,
              products: store.products.filter((p) => p.id !== productId),
            }))
            .filter((s) => s.products.length > 0),
        })),

      clearCart: () => set({ cart: [] }),

      syncCart: async () => {
        const { cart } = get();
        await syncCartWithBackend(cart);
      },

      loadCart: async (user_id) => {
        const backendCart = await loadCartFromBackend(user_id);
        set({ cart: backendCart });
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;
