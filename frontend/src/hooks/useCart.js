'use client';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, updateQty, clearCart, selectCart, selectCartTotal, selectCartCount } from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items    = useSelector(selectCart);
  const total    = useSelector(selectCartTotal);
  const count    = useSelector(selectCartCount);

  return {
    items, total, count,
    addItem:    (product)     => dispatch(addItem(product)),
    removeItem: (id)          => dispatch(removeItem(id)),
    updateQty:  (id, qty)     => dispatch(updateQty({ id, qty })),
    clearCart:  ()            => dispatch(clearCart()),
  };
}
