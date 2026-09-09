import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/layouts/LandingNav';
import BackgroundModel from '../assets/images/BackgroundModel.png';
import ShopCards from '../components/cards/ProductCards';
import Footer from '../components/layouts/Footer';
import LeftArrow from '../assets/images/LeftArrow.svg';
import RightArrow from '../assets/images/RightArrow.svg';
import ProductCardModal from '../components/modals/ProductCardModal';
import AccessoriesCardModal from '../components/modals/ProductAccessoriesModal';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProductVariant {
  variant: string;
  stock: number;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: number;
  product_stock: number;
  product_image: string;
  variant?: string;
  variant_type?: string;
  created_at?: string;
}

interface GroupedProduct extends Product {
  variants: ProductVariant[];
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function ShopPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [accessoriesModalOpen, setAccessoriesModalOpen] = useState(false);
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(() => {
    api.get('/cart')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : [];
        setCartCount(items.length);
      })
      .catch(() => setCartCount(0));
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  const groupProductsByName = (productList: Product[]): GroupedProduct[] => {
    const grouped: Record<string, GroupedProduct> = {};
    productList.forEach((product) => {
      if (!grouped[product.product_name]) {
        grouped[product.product_name] = {
          ...product,
          product_stock: 0,
          variants: [],
        };
      }
      grouped[product.product_name].product_stock += (product.product_stock || 0);
      grouped[product.product_name].variants.push({
        variant: product.variant || '',
        stock: product.product_stock,
      });
    });
    return Object.values(grouped);
  };

  const openProductModal = (product: GroupedProduct) => {
    setSelectedProduct(product || null);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setSelectedProduct(null);
  };

  const openAccessoriesModal = () => {
    setAccessoriesModalOpen(true);
  };

  const closeAccessoriesModal = () => {
    setAccessoriesModalOpen(false);
  };

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const grouped = groupProductsByName(list);
        setProducts(grouped);
      })
      .catch(() => setProducts([]));
    fetchCartCount();
  }, [fetchCartCount]);

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.product_description && p.product_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.product_price - b.product_price;
    if (sortBy === 'price-high') return b.product_price - a.product_price;
    if (sortBy === 'name') return a.product_name.localeCompare(b.product_name);
    return 0;
  });

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <LandingNav cartCount={cartCount} />
      <div className='bg-[#F6F6F6] flex flex-col justify-center'>
        <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
          <img
            src={BackgroundModel}
            alt="Background Model"
            className='w-full h-full object-cover'
          />
        </div>

        {/* Filters */}
        <div className='py-4 sm:py-8 flex flex-col sm:flex-row justify-between text-[#727272] gap-3 px-4 sm:px-10 lg:px-20'>
          <div className='flex flex-col gap-2 sm:flex-row sm:gap-5'>
            {/* Row 1 on mobile: View + Sort by */}
            <div className='flex flex-row gap-3 items-center'>
              <div className='flex flex-row gap-1 items-center'>
                <p className='text-sm whitespace-nowrap'>View</p>
                <select
                  className='border border-[#727272] rounded px-2 py-1 text-sm'
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="16">16</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div className='flex flex-row gap-1 items-center'>
                <p className='text-sm whitespace-nowrap'>Sort by</p>
                <select
                  className='border border-[#727272] rounded px-2 py-1 text-sm'
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
            {/* Row 2 on mobile: Search */}
            <div className='flex flex-row items-center gap-2 border border-[#727272] rounded px-2 py-1 w-full sm:w-auto'>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className='shrink-0'>
                <path d="M21 21l-4.35-4.35" stroke="#727272" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#727272" strokeWidth="2" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="border-none outline-none bg-transparent w-full text-sm text-gray-700 placeholder:text-gray-400"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className='flex flex-row gap-1 items-center text-sm'>
            <p>Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} results</p>
          </div>
        </div>

        {/* Shop cards */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 lg:px-10 pb-10'>
          {paginatedProducts.map(p => (
            <ShopCards
              key={p.product_id}
              onClick={() => openProductModal(p)}
              image={p.product_image}
              name={p.product_name}
              description={p.product_description}
              price={p.product_price}
              stock={p.product_stock}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className='flex flex-row justify-center items-center gap-4 pb-10'>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-3 py-1 hover:cursor-pointer disabled:opacity-50'
          >
            <img src={LeftArrow} alt="Left Arrow" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 border rounded hover:cursor-pointer ${
                page === currentPage
                  ? 'bg-[#9C0306] text-white border-gray-400'
                  : 'border-[#9C0306] text-[#9C0306]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-3 py-1 hover:cursor-pointer disabled:opacity-50'
          >
            <img src={RightArrow} alt="Right Arrow" />
          </button>
        </div>

        {/* Footer */}
        <Footer />

        {/* Modals */}
        <ProductCardModal
          isOpen={productModalOpen}
          onClose={closeProductModal}
          product={selectedProduct}
          onShowToast={showToast}
          onCartAdded={fetchCartCount}
        />
        <AccessoriesCardModal
          isOpen={accessoriesModalOpen}
          onClose={closeAccessoriesModal}
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
      </div>
    </>
  );
}
