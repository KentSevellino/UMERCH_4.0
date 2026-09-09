import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import BackgroundModel from '../../assets/images/BackgroundModel.png';
import ShopCards from '../cards/ProductCards';
import Footer from '../layouts/Footer';
import LeftArrow from '../../assets/images/LeftArrow.svg';
import RightArrow from '../../assets/images/RightArrow.svg';
import ProductCardModal from '../modals/ProductCardModal';
import AccessoriesCardModal from '../modals/ProductAccessoriesModal';
import api from '../../services/api';
import Placeholder from '../../assets/images/product-placeholder.svg';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: string | number;
  product_stock: number;
  product_image: string;
  created_at?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-low' | 'price-high' | 'newest';

export default function ProductsView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ProductModalOpen, setProductModalOpen] = useState(false);
  const [AccessoriesModalOpen, setAccessoriesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter and Sort State
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const openProductModal = () => {
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
  };

  const openAccessoriesModal = () => {
    setAccessoriesModalOpen(true);
  };

  const closeAccessoriesModal = () => {
    setAccessoriesModalOpen(false);
  };

  const openProductModalWith = (product: Product) => {
    if (user) {
      setSelectedProduct(product);
      setProductModalOpen(true);
    } else {
      setSelectedProduct(product);
      setShowLoginPrompt(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const normalizeImageUrl = (u: string): string => {
    if (!u) return Placeholder as unknown as string;
    const s = String(u).trim();
    if (!s) return Placeholder as unknown as string;
    if (s.startsWith('http')) return s;
    if (s.startsWith('/')) return s;
    if (s.startsWith('public/storage/')) return '/' + s.replace(/^public\//, '');
    if (s.startsWith('storage/')) return '/' + s;
    return '/' + s;
  };

  // Fetch products
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, []);

  // Apply sorting and filtering
  useEffect(() => {
    let filtered = products.filter(p =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.product_description && p.product_description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    let sorted = [...filtered];

    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      case 'price-low':
        sorted.sort((a, b) => parseFloat(String(a.product_price)) - parseFloat(String(b.product_price)));
        break;
      case 'price-high':
        sorted.sort((a, b) => parseFloat(String(b.product_price)) - parseFloat(String(a.product_price)));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'default':
      default:
        break;
    }

    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [products, sortBy, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const displayStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, filteredProducts.length);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Navbar />
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
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className='border border-[#727272] rounded px-2 py-1 cursor-pointer text-sm'
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
                  value={sortBy}
                  onChange={handleSortChange}
                  className='border border-[#727272] rounded px-2 py-1 cursor-pointer text-sm'
                >
                  <option value="default">Default</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
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
                value={searchQuery}
                onChange={handleSearchChange}
                className="border-none outline-none bg-transparent w-full text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className='flex flex-row gap-1 items-center text-sm text-[#727272]'>
            <p>Showing {displayStart}-{displayEnd} of {filteredProducts.length} results</p>
          </div>
        </div>

        {/* Shop cards */}
        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 lg:px-10 pb-10'>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map(p => (
              <ShopCards
                key={p.product_id}
                onClick={() => openProductModalWith(p)}
                image={normalizeImageUrl(p.product_image)}
                name={p.product_name}
                description={p.product_description}
                price={p.product_price}
                stock={p.product_stock}
              />
            ))
          ) : (
            <div className='w-full text-center py-10'>
              <p className='text-gray-500 text-lg'>No products found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex flex-row justify-center items-center gap-4 pb-10'>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className='px-3 py-1 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <img src={LeftArrow} alt="Left Arrow" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 border rounded hover:cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#9C0306] text-white border-[#9C0306]'
                    : 'border-[#9C0306] text-[#9C0306]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='px-3 py-1 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <img src={RightArrow} alt="Right Arrow" />
            </button>
          </div>
        )}

        {/* Footer */}
        <Footer />
        {ProductModalOpen && (
          <ProductCardModal
            isOpen={ProductModalOpen}
            onClose={() => setProductModalOpen(false)}
            product={selectedProduct}
            onShowToast={showToast}
          />
        )}

        {showLoginPrompt && (
          <div className='fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/40' onClick={() => setShowLoginPrompt(false)}>
            <div className='bg-white rounded-lg p-6 w-[420px]' onClick={e => e.stopPropagation()}>
              <h2 className='text-lg font-semibold mb-2'>Sign in required</h2>
              <p className='text-sm text-gray-600 mb-4'>You need to sign in to view product details and purchase items.</p>
              <div className='flex gap-3 justify-end'>
                <button onClick={() => setShowLoginPrompt(false)} className='px-4 py-2 border rounded hover:cursor-pointer'>Cancel</button>
                <button onClick={() => navigate('/login')} className='px-4 py-2 bg-[#9C0306] text-white rounded hover:cursor-pointer'>Sign in</button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-[70] ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.message}
          </div>
        )}


      </div>
    </>
  );
}
