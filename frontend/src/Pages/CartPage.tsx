import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LandingNav from '../components/layouts/LandingNav';
import BackgroundModel from '../assets/images/BackgroundModel.png';
import CartsNav from '../components/layouts/CartsNav';
import { normalizeImageUrl } from '../constants';
import Footer from '../components/layouts/Footer';
import RemoveCartModal from '../components/modals/RemoveCartModal';
import ReceiptForm from '../components/modals/ReceiptFormModal';
import api from '../services/api';
import { variantTypesMap } from '../constants';

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: number;
  product_stock: number;
  product_image: string;
  variant_type?: string;
}

interface CartItem {
  cart_item_id: number;
  product_id: number;
  product?: Product;
  variant: string;
  price: number;
  quantity: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingVariant, setEditingVariant] = useState<number | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [receiptFormOpen, setReceiptFormOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get('/cart')
      .then(response => {
        setCartItems(response.data || []);
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
      });

    intervalRef.current = setInterval(() => {
      api.get('/cart')
        .then(response => {
          setCartItems(response.data || []);
        })
        .catch(err => {
          console.error('Error polling cart:', err);
        });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const openReceiptForm = () => {
    setReceiptFormOpen(true);
  };

  const closeReceiptForm = () => {
    setReceiptFormOpen(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectItem = (cartItemId: number) => {
    if (selectedItems.includes(cartItemId)) {
      setSelectedItems(selectedItems.filter(id => id !== cartItemId));
    } else {
      setSelectedItems([...selectedItems, cartItemId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.cart_item_id));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.cart_item_id)) {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleRemoveItem = (cartItem: CartItem) => {
    setItemToRemove(cartItem);
    setRemoveModalOpen(true);
  };

  const handleRemoveConfirmed = (cartItemId: number) => {
    setCartItems(cartItems.filter(item => item.cart_item_id !== cartItemId));
    setSelectedItems(selectedItems.filter(id => id !== cartItemId));
    showToast('Item removed from cart successfully!', 'success');

    const existing = sessionStorage.getItem('checkoutItems');
    if (existing) {
      const existingItems = JSON.parse(existing);
      const filtered = existingItems.filter((item: CartItem) => item.cart_item_id !== cartItemId);
      if (filtered.length > 0) {
        sessionStorage.setItem('checkoutItems', JSON.stringify(filtered));
      } else {
        sessionStorage.removeItem('checkoutItems');
      }
    }
  };

  const handleVariantChange = async (cartItemId: number, newVariant: string) => {
    try {
      const cartItem = cartItems.find(item => item.cart_item_id === cartItemId);
      if (!cartItem) return;

      const inventoryResponse = await api.get('/check-inventory', {
        params: {
          product_id: cartItem.product_id,
          variant: newVariant,
        },
      });

      const inventory = inventoryResponse.data;

      if (!inventory || inventory.quantity === 0 || inventory.quantity < 1) {
        const variantType = cartItem.product?.variant_type || 'size';
        const variantLabel = variantType === 'size' ? 'size' :
                             variantType === 'mug' ? 'mug size' :
                             variantType === 'tumbler' ? 'tumbler size' :
                             variantType === 'notebook' ? 'page option' :
                             variantType === 'pen' ? 'color' : 'variant';
        showToast(`This ${variantLabel} (${newVariant}) is out of stock`, 'error');
        return;
      }

      await api.put(`/cart/${cartItemId}`, { variant: newVariant });
      setCartItems(cartItems.map(item =>
        item.cart_item_id === cartItemId
          ? { ...item, variant: newVariant }
          : item
      ));
      showToast('Variant updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating variant:', error);
      showToast('Error updating variant. Please try again.', 'error');
    }
  };

  const subtotal = calculateSubtotal();

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showToast("You didn't select an item", 'error');
      return;
    }
    const itemsToCheckout = cartItems.filter(item =>
      selectedItems.includes(item.cart_item_id)
    );
    sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));
    navigate('/Checkout');
  };

  return (
    <>
      <div className='bg-[#F6F6F6] min-h-screen'>
        <LandingNav />
        <div className='bg-[#F6F6F6]'>
          <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
            <img
              src={BackgroundModel}
              alt="Background Model"
              className='w-full h-full object-cover'
            />
          </div>
          <div className='py-7'>
            <CartsNav />
          </div>
          <div className='flex flex-col items-center justify-center py-3 gap-3'>
            <div className='p-2 flex flex-col gap-6'>
              <div className='flex flex-row'>
                <div className='flex flex-row bg-white w-263 h-17 rounded-[10px] items-center p-3'>
                  <div className='gap-2 flex flex-row items-center'>
                    <input
                      type="checkbox"
                      className='w-3 h-3 accent-[#9C0306]'
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span className='text-[13px] text-[#575757]'>Product</span>
                  </div>
                  <div className='ml-auto flex flex-row gap-21 text-[13px] text-[#575757]'>
                    <span>Unit price</span>
                    <span>Quantity</span>
                    <span>Total Price</span>
                    <span className='transform translate-x-[-17px]'>Actions</span>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                {cartItems.length === 0 ? (
                  <div className='text-center py-8 text-[#575757]'>Your cart is empty</div>
                ) : (
                  cartItems.map(item => {
                    const variantType = item.product?.variant_type || 'size';
                    const variants = variantTypesMap[variantType] || variantTypesMap.size;

                    return (
                      <div key={item.cart_item_id} className='flex flex-row bg-white w-263 rounded-[10px] p-3 items-center gap-10'>
                        {/* Product Info Column */}
                        <div className='flex flex-row gap-2 items-center flex-1'>
                          <input
                            type="checkbox"
                            className='w-3 h-3 accent-[#9C0306] mt-1'
                            checked={selectedItems.includes(item.cart_item_id)}
                            onChange={() => handleSelectItem(item.cart_item_id)}
                          />
                          <img
                            src={normalizeImageUrl(item.product?.product_image)}
                            alt={item.product?.product_name}
                            className='w-20 h-20 object-cover rounded'
                          />
                          <div className='flex flex-col gap-1'>
                            <h3 className='font-semibold text-[13px]'>{item.product?.product_name}</h3>
                            <p className='text-[11px] text-[#575757] line-clamp-2'>{item.product?.product_description}</p>
                          </div>
                        </div>

                        {/* Variant selector */}
                        <div className='flex flex-row gap-2 items-center transform translate-x-[-130px]'>
                          <span className='text-[10px] text-[#575757] whitespace-nowrap'>
                            {variantType === 'size' ? 'Size:' :
                             variantType === 'mug' ? 'Mug Size:' :
                             variantType === 'tumbler' ? 'Tumbler Size:' :
                             variantType === 'notebook' ? 'Pages:' :
                             variantType === 'pen' ? 'Color:' :
                             variantType === 'umbrella' ? 'Type:' :
                             variantType === 'keychain' ? 'Type:' :
                             variantType === 'totebag' ? 'Type:' :
                             variantType === 'pillow' ? 'Type:' :
                             'Variant:'}
                          </span>
                          <select
                            value={item.variant}
                            onChange={(e) => handleVariantChange(item.cart_item_id, e.target.value)}
                            className='px-2 py-1 text-[11px] border border-[#DDDDDD] rounded bg-white text-black hover:border-[#9C0306] cursor-pointer'
                          >
                            {variants.map(variant => (
                              <option key={variant} value={variant}>
                                {variant}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Unit Price Column */}
                        <div className='w-24 text-center transform translate-x-[-50px]'>
                          <span className='text-[13px] text-[#575757]'>₱{Number(item.price).toFixed(2)}</span>
                        </div>

                        {/* Quantity Column */}
                        <div className='w-16 text-center transform translate-x-[-28px]'>
                          <span className='text-[13px] text-[#575757]'>{item.quantity}</span>
                        </div>

                        {/* Total Price Column */}
                        <div className='w-24 text-center'>
                          <span className='text-[13px] font-semibold text-[#9C0306]'>₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        {/* Actions Column */}
                        <div className='w-20 text-center'>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className='bg-white border border-[#9C0306] text-[#9C0306] font-medium text-[13px] rounded-[20px] w-18 h-7 hover:bg-[#9C0306] hover:text-white transition duration-300 hover:cursor-pointer'
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className='mt-4 flex flex-row justify-center items-center gap-3'>
              <div className='flex justify-center items-center w-65 h-8 border text-[#9C0306] border-[#9C0306] rounded-[10px] hover:cursor-pointer hover:bg-[#9C0306] hover:text-white transition duration-300'>
                <Link to="/Shop" className='text-[13px] font-bold hover:cursor-pointer'>Continue Shopping</Link>
              </div>
            </div>
            <div className='mt-3 flex flex-col justify-center bg-white w-263 h-65 rounded-[10px]'>
              <div className='flex justify-start px-4'>
                <h1 className='text-[24px] font-semibold'>Cart Total</h1>
              </div>
              <div className='mt-3 flex flex-row justify-between px-4'>
                <h1 className='text-[16px] font-medium'>SUBTOTAL</h1>
                <h1 className='text-[16px] font-medium'>₱{subtotal.toFixed(2)}</h1>
              </div>
              <div className='mt-10 flex flex-row justify-between px-4'>
                <h1 className='text-[#9C0306] text-[24px] font-bold'>TOTAL</h1>
                <h1 className='text-[#9C0306] text-[24px] font-bold'>₱{subtotal.toFixed(2)}</h1>
              </div>

              <div className='px-7 flex justify-center items-center'>
                <div className='mt-7 ml-auto flex justify-center items-center bg-[#9C0306] rounded-[10px] w-48 h-8 hover:cursor-pointer'>
                  <button
                    className='text-[#F6F6F6] text-[13px] font-bold hover:cursor-pointer'
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='mt-5'>
            <Footer />
          </div>
        </div>
      </div>

      {/* Remove Cart Item Modal */}
      <RemoveCartModal
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setItemToRemove(null);
        }}
        cartItem={itemToRemove}
        onDeleted={handleRemoveConfirmed}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-[70] animate-pulse ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
