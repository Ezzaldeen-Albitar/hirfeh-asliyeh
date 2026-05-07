import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, searchOpen: false, sidebarCollapsed: false },
  reducers: {
    toggleCart:    (state) => { state.cartOpen = !state.cartOpen; },
    toggleSearch:  (state) => { state.searchOpen = !state.searchOpen; },
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    closeAll:      (state) => { state.cartOpen = false; state.searchOpen = false; },
  },
});

export const { toggleCart, toggleSearch, toggleSidebar, closeAll } = uiSlice.actions;
export default uiSlice.reducer;
