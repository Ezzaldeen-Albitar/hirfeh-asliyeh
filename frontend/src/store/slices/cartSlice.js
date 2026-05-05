import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, { payload }) => {
      const exists = state.items.find(i => i._id === payload._id);
      if (exists) {
        exists.qty += 1;
      } else {
        state.items.push({ ...payload, qty: 1 });
      }
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    removeItem: (state, { payload }) => {
      state.items = state.items.filter(i => i._id !== payload);
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    updateQty: (state, { payload: { id, qty } }) => {
      const item = state.items.find(i => i._id === id);
      if (item) item.qty = qty;
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart      = (s) => s.cart.items;
export const selectCartTotal = (s) => s.cart.total;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.qty, 0);
