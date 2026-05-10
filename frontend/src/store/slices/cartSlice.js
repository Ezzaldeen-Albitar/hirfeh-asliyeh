import { createSlice } from '@reduxjs/toolkit';

const save = (items) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('ha_cart', JSON.stringify(items)); } catch {}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], hydrated: false },
  reducers: {
    hydrateCart: (state, { payload }) => {
      state.items    = payload;
      state.hydrated = true;
    },
    addItem: (state, { payload }) => {
      const existing = state.items.find(i => i._id === payload._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, payload.stock || 99);
      } else {
        state.items.push({ ...payload, qty: 1 });
      }
      save(state.items);
    },
    addItemWithQty: (state, { payload: { product, qty } }) => {
      const existing = state.items.find(i => i._id === product._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, product.stock || 99);
      } else {
        state.items.push({ ...product, qty: Math.min(qty, product.stock || 99) });
      }
      save(state.items);
    },
    removeItem: (state, { payload }) => {
      state.items = state.items.filter(i => i._id !== payload);
      save(state.items);
    },
    updateQty: (state, { payload: { id, qty } }) => {
      const item = state.items.find(i => i._id === id);
      if (item) item.qty = Math.max(1, qty);
      save(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      save([]);
    },
  },
});

export const { addItem, addItemWithQty, removeItem, updateQty, clearCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart      = (s) => s.cart.items;
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0);
