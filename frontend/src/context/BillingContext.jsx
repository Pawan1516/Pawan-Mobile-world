import { createContext, useState, useEffect } from 'react';

export const BillingContext = createContext();

export const BillingProvider = ({ children }) => {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    notes: ''
  });

  const [selectedItems, setSelectedItems] = useState([]); // Array of { productId, name, qty, price, total }
  const [customItems, setCustomItems] = useState([]); // Array of { name, qty, price, total }
  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);

  const [totals, setTotals] = useState({
    subtotal: 0,
    gstAmount: 0,
    total: 0,
    isOverridden: false
  });

  useEffect(() => {
    const itemsSubtotal = selectedItems.reduce((acc, item) => acc + item.total, 0);
    const customSubtotal = customItems.reduce((acc, item) => acc + item.total, 0);
    const subtotal = itemsSubtotal + customSubtotal;

    const afterDiscount = Math.max(0, subtotal - discount);
    const gstAmount = (afterDiscount * gstPercent) / 100;
    const calculatedTotal = afterDiscount + gstAmount;

    setTotals(prev => ({
      subtotal,
      gstAmount,
      total: prev.isOverridden ? prev.total : calculatedTotal,
      isOverridden: prev.isOverridden
    }));
  }, [selectedItems, customItems, discount, gstPercent]);

  const setManualTotal = (newTotal) => {
    setTotals(prev => ({
      ...prev,
      total: newTotal,
      isOverridden: true
    }));
  };

  const addItem = (product) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item =>
          item.productId === product._id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        qty: 1,
        price: product.price,
        total: product.price,
        warranty: product.warranty || 'No Warranty'
      }];
    });
  };

  const updateItemWarranty = (id, warranty, isCustom = false) => {
    if (isCustom) {
      setCustomItems(prev => prev.map((item, i) => i === id ? { ...item, warranty } : item));
    } else {
      setSelectedItems(prev => prev.map(item => item.productId === id ? { ...item, warranty } : item));
    }
  };

  const removeItem = (productId) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing && existing.qty > 1) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, qty: item.qty - 1, total: (item.qty - 1) * item.price }
            : item
        );
      }
      return prev.filter(item => item.productId !== productId);
    });
  };

  const clearBill = () => {
    setCustomer({
      name: '',
      phone: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
      notes: ''
    });
    setSelectedItems([]);
    setCustomItems([]);
    setDiscount(0);
    setGstPercent(0);
    setTotals({
      subtotal: 0,
      gstAmount: 0,
      total: 0,
      isOverridden: false
    });
  };

  return (
    <BillingContext.Provider value={{
      customer, setCustomer,
      selectedItems, setSelectedItems, addItem, removeItem, updateItemWarranty,
      customItems, setCustomItems,
      discount, setDiscount,
      gstPercent, setGstPercent,
      totals, setManualTotal,
      clearBill
    }}>
      {children}
    </BillingContext.Provider>
  );
};
