import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('ha_cart') || '[]'); }
  catch { return []; }
};

const save = (items) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('ha_cart', JSON.stringify(items)); } catch {}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addItem: (state, { payload }) => {
      const existing = state.items.find(i => i._id === payload._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, payload.stock || 99);
      } else {
        state.items.push({ ...payload, qty: 1 });
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

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart      = (s) => s.cart.items;
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0);
