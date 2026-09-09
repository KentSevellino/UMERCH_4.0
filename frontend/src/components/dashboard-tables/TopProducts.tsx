import React from 'react';
import { Link } from 'react-router-dom';
import Tshirt from '../../assets/images/tshirt.jpg';

interface TopProduct {
  rank?: number;
  name: string;
  category?: string;
  quantity?: number;
  sales?: number;
  product_image?: string;
  image?: string;
}

interface TopProductsProps {
  topProducts?: TopProduct[];
  topProductsPeriod: string;
  setTopProductsPeriod: (period: string) => void;
}

const normalizeImageUrl = (u: string | undefined): string => {
  if (!u) return Tshirt;
  const s = String(u).trim();
  if (!s) return Tshirt;
  if (s.startsWith('http')) return s;
  if (s.startsWith('/')) return s;
  if (s.startsWith('public/storage/')) return '/' + s.replace(/^public\//, '');
  if (s.startsWith('storage/')) return '/' + s;
  return '/' + s;
};

export default function TopProducts({ topProducts = [], topProductsPeriod, setTopProductsPeriod }: TopProductsProps) {
  return (
    <div className="w-[320px] bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Top Products</h3>
        <Link to="/admin/inventory/add" className="text-sm text-gray-500">View All</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTopProductsPeriod('weekly')}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${topProductsPeriod === 'weekly'
            ? 'bg-red-700 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTopProductsPeriod('monthly')}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${topProductsPeriod === 'monthly'
            ? 'bg-red-700 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Monthly
        </button>
      </div>

      <div className="space-y-4">
        {topProducts && topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <span className="text-lg font-bold text-gray-400 w-6">{product.rank || index + 1}</span>
              <img
                src={normalizeImageUrl(product.product_image || product.image)}
                alt={product.name || 'Product'}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{product.name || 'Product'}</div>
                <div className="text-xs text-gray-500 truncate">{product.category || 'N/A'}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-sm">{product.quantity || 0} <span className="text-xs text-gray-500">Stocks</span></div>
                <div className="text-xs text-gray-500">₱{(product.sales || 0).toLocaleString()}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            No top products data available
          </div>
        )}
      </div>
    </div>
  );
}
