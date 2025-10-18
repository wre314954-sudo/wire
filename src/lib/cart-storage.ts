import { getUserCart, saveUserCart } from './db-services';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  color: string;
  quantity: number;
  unitType: 'metres' | 'coils';
  unitPrice: number;
  imageUrl: string;
}

const CART_STORAGE_KEY = 'wire_cable_cart';

let currentUserId: string | null = null;

export const setCartUserId = (userId: string | null): void => {
  currentUserId = userId;
};

export const getCartItems = async (): Promise<CartItem[]> => {
  if (typeof window === 'undefined') return [];

  if (currentUserId) {
    try {
      return await getUserCart(currentUserId);
    } catch (error) {
      console.error('Error fetching cart from database:', error);
    }
  }

  const stored = localStorage.getItem(CART_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveCartItems = async (items: CartItem[]): Promise<void> => {
  if (typeof window === 'undefined') return;

  if (currentUserId) {
    try {
      await saveUserCart(currentUserId, items);
      window.dispatchEvent(new Event('cart-updated'));
      return;
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
};

export const addToCart = async (item: Omit<CartItem, 'id'>): Promise<void> => {
  const items = await getCartItems();
  const existingIndex = items.findIndex(
    i => i.productId === item.productId &&
         i.color === item.color &&
         i.unitType === item.unitType
  );

  if (existingIndex >= 0) {
    items[existingIndex].quantity += item.quantity;
  } else {
    items.push({ ...item, id: `cart_${Date.now()}_${Math.random()}` });
  }

  await saveCartItems(items);
};

export const updateCartItemQuantity = async (id: string, quantity: number): Promise<void> => {
  const items = await getCartItems();
  const index = items.findIndex(i => i.id === id);

  if (index >= 0) {
    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = quantity;
    }
    await saveCartItems(items);
  }
};

export const removeFromCart = async (id: string): Promise<void> => {
  const items = await getCartItems();
  const filtered = items.filter(i => i.id !== id);
  await saveCartItems(filtered);
};

export const clearCart = async (): Promise<void> => {
  await saveCartItems([]);
};

export const getCartTotal = async (): Promise<number> => {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
};

export const getCartItemCount = async (): Promise<number> => {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
};
