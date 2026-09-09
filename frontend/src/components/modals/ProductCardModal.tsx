import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AddToCart from '../../assets/images/Cart.svg';
import DefaultImage from '../../assets/images/product-placeholder.svg';
import SizeChart from '../../assets/images/SizeChart.png';

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: number;
  product_stock: number;
  product_image: string;
  variant_type?: string;
}

interface ProductCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onCartAdded?: () => void;
}

const variantTypesMap: Record<string, string[]> = {
  size: ['XS', 'S', 'M', 'L', 'XL'],
  mug: ['11ml', '13ml'],
  tumbler: ['12oz', '16oz', '20oz', '24oz'],
  notebook: ['30 pages', '50 pages', '100 pages'],
  pen: ['pen'],
  umbrella: ['umbrella'],
  keychain: ['keychain'],
  totebag: ['totebag'],
  pillow: ['pillow'],
};

export default function ProductCardModal({ isOpen, onClose, product, onShowToast, onCartAdded }: ProductCardModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && product?.product_id) {
      fetchVariantStocks();
    }
  }, [isOpen, product?.product_id]);

  const fetchVariantStocks = async () => {
    try {
      const variantType = product?.variant_type || 'size';
      const availableVariants = variantTypesMap[variantType] || ['1'];

      const res = await api.get('/inventory');
      const inventoryData = res.data || [];

      const stocks: Record<string, number> = {};
      availableVariants.forEach(variant => {
        stocks[variant] = 0;
      });

      inventoryData.forEach((inv: { product_id: number; variant: string; quantity: number }) => {
        if (inv.product_id === product!.product_id) {
          stocks[inv.variant] = inv.quantity;
        }
      });
      setVariantStocks(stocks);
    } catch (error) {
      try {
        const res = await api.get('/products');
        const allProducts = res.data || [];
        const variantType = product?.variant_type || 'size';
        const availableVariants = variantTypesMap[variantType] || ['1'];

        const stocks: Record<string, number> = {};
        availableVariants.forEach(variant => {
          stocks[variant] = 0;
        });

        allProducts.forEach((p: { product_name: string; variant: string; product_stock: number }) => {
          if (p.product_name === product!.product_name) {
            stocks[p.variant] = p.product_stock;
          }
        });
        setVariantStocks(stocks);
      } catch (fallbackError) {
        console.error('Error fetching variant stocks:', fallbackError);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const variantType = product?.variant_type || 'size';
      const availableVariants = variantTypesMap[variantType] || ['1'];
      setSelectedVariant(availableVariants[0]);
    }
  }, [isOpen, product?.product_id]);

  const handleAddToCart = async () => {
    if (!product?.product_id) {
      onShowToast('Product information missing', 'error');
      return;
    }

    if (variantStocks[selectedVariant!] === 0 || variantStocks[selectedVariant!] === undefined) {
      onShowToast('This option is out of stock', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cart', {
        product_id: product.product_id,
        variant: selectedVariant,
        quantity,
        price: product.product_price,
      });
      onShowToast('Item added to cart successfully!', 'success');
      if (onCartAdded) onCartAdded();
      setQuantity(1);
      setTimeout(() => onClose(), 50);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const message = error.response?.data?.message || 'Failed to add item to cart';
      onShowToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      try {
        const pending = {
          product_id: product!.product_id,
          variant: selectedVariant,
          quantity,
          price: product!.product_price,
        };
        sessionStorage.setItem('pendingBuy', JSON.stringify(pending));
      } catch (_e) {}
      window.location.href = '/Landing?popup=1';
      return;
    }

    if (!product?.product_id) {
      onShowToast('Product information missing', 'error');
      return;
    }

    if (variantStocks[selectedVariant!] === 0 || variantStocks[selectedVariant!] === undefined) {
      onShowToast('This option is out of stock', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cart', {
        product_id: product.product_id,
        variant: selectedVariant,
        quantity,
        price: product.product_price,
      });

      const cartResponse = await api.get('/cart');
      const cartItems = cartResponse.data || [];

      if (cartItems.length > 0) {
        const lastItem = cartItems[cartItems.length - 1];
        sessionStorage.setItem('checkoutItems', JSON.stringify([lastItem]));
      }

      onShowToast('Item added to cart!', 'success');

      onClose();
      setTimeout(() => {
        window.location.href = '/Checkout';
      }, 500);
    } catch (error: any) {
      console.error('Buy now error:', error);
      const message = error.response?.data?.message || 'Failed to add item to cart';
      onShowToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  try {
    const normalize = (u: string | undefined | null): string => {
      if (!u) return DefaultImage;
      const s = String(u).trim();
      if (!s) return DefaultImage;
      if (s.startsWith('http')) return s;
      if (s.startsWith('/')) return s;
      if (s.startsWith('public/storage/')) return '/' + s.replace(/^public\//, '');
      if (s.startsWith('storage/')) return '/' + s;
      return '/' + s;
    };

    const imgSrc = normalize(product?.product_image);
    const name = product?.product_name || 'Product';
    const description = product?.product_description || 'No description available.';
    const price = Number(product?.product_price || 0);

    const variantType = product?.variant_type || 'size';
    const variants = variantTypesMap[variantType] || ['1'];
    const variantLabel = variantType.charAt(0).toUpperCase() + variantType.slice(1);

    const formatPrice = (v: number) => `₱${Number(v || 0).toFixed(2)}`;

    return (
      <>
        <div
          className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-white/5 p-4"
          onClick={onClose}
        >
          <div
            className="bg-white p-2 rounded-[20px] shadow-lg relative w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none z-10"
              aria-label="Close"
            >
              ×
            </button>

            <div className="flex flex-col sm:flex-row p-5 sm:p-8 gap-5">
              <div className="flex items-start justify-center sm:flex-shrink-0">
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-full sm:w-[280px] lg:w-[350px] h-auto rounded-[20px] object-contain"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = DefaultImage;
                  }}
                />
              </div>

              <div className="flex flex-col justify-start flex-1">
                <h2 className="font-semibold text-[20px] sm:text-[24px] leading-tight">{name}</h2>
                <div className="mt-2 text-[12px]">{description}</div>
                <div className="mt-3">
                  <h1 className="text-[#9C0306] font-semibold text-[22px] sm:text-[24px]">{formatPrice(price)}</h1>
                </div>
                <div className="mt-5 flex flex-row flex-wrap items-start gap-2">
                  <span className="text-[12px] py-2 shrink-0">{variantLabel}</span>
                  <div className="flex flex-row flex-wrap gap-2 items-center">
                    {variants.map(variant => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 h-10 font-semibold hover:cursor-pointer transition-all text-sm ${
                          selectedVariant === variant
                            ? 'bg-[#9C0306] text-white border-2 border-[#9C0306]'
                            : 'bg-white text-black border-2 border-[#DDDDDD] hover:border-[#9C0306]'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
                {variantType === 'size' && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-[#0058B2] hover:underline hover:cursor-pointer text-sm"
                    >
                      Size Chart &gt;
                    </button>
                  </div>
                )}
                <div className="mt-5 flex flex-row gap-4 items-center flex-wrap">
                  <span className="text-[12px]">Quantity</span>
                  <div className="flex flex-row">
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center border border-[#DDDDDD] text-lg font-bold bg-white"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="w-12 h-8 flex items-center justify-center text-[#9C0306] border border-[#DDDDDD]">{quantity}</span>
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center border border-[#DDDDDD] text-lg font-bold bg-white"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[#7F7F7F] text-[10px] font-light">
                    {variantStocks[selectedVariant!] !== undefined ? variantStocks[selectedVariant!] : 0} pieces available
                  </span>
                </div>
                <div className="mt-6 flex flex-row flex-wrap gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={loading || variantStocks[selectedVariant!] === 0}
                    className="bg-white border border-[#9C0306] flex-1 min-w-[130px] h-10 rounded-[10px] flex justify-center items-center hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src={AddToCart} alt="Add to Cart" className="mr-2 w-5 h-5" />
                    <span className="text-[#9C0306] text-[14px] font-semibold">{loading ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={loading || variantStocks[selectedVariant!] === 0}
                    className="bg-[#9C0306] flex-1 min-w-[130px] h-10 rounded-[10px] flex justify-center items-center hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-[14px] font-semibold">{loading ? 'Processing...' : 'Buy Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSizeChart && (
          <div
            className="fixed inset-0 z-[60] flex justify-center items-center backdrop-blur-xs bg-white/5"
            onClick={() => setShowSizeChart(false)}
          >
            <div
              className="bg-white p-4 rounded-[20px] shadow-lg relative max-w-[600px] w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <img src={SizeChart} alt="Size Chart" className="w-full h-auto rounded-[10px]" />
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('ProductCardModal error:', error);
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/40" onClick={onClose}>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600 mb-3">Error loading product details</p>
          <button onClick={onClose} className="bg-[#9C0306] text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    );
  }
}
