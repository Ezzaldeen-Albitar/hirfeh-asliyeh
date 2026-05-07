'use client';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, addItemWithQty, removeItem, updateQty, clearCart, selectCart, selectCartTotal, selectCartCount } from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items    = useSelector(selectCart);
  const total    = useSelector(selectCartTotal);
  const count    = useSelector(selectCartCount);

  return {
    items, total, count,
    addItem:       (product)          => dispatch(addItem(product)),
    addItemWithQty:(product, qty)     => dispatch(addItemWithQty({ product, qty })),
    removeItem:    (id)               => dispatch(removeItem(id)),
    updateQty:     (id, qty)          => dispatch(updateQty({ id, qty })),
    clearCart:     ()                 => dispatch(clearCart()),
  };
}