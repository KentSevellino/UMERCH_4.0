import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ProductCard from '../cards/ProductCards';
import Placeholder from '../../assets/images/product-placeholder.svg';
import { Link } from 'react-router-dom';

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: string | number;
  product_stock: number;
  product_image: string;
  created_at?: string;
}

export default function FeatureProducts() {
  const [items, setItems] = useState<Product[]>([]);

  const normalizeImageUrl = (u: string): string => {
    if (!u) return Placeholder as unknown as string;

    const s = String(u).trim();
    if (!s) return Placeholder as unknown as string;

    if (s.startsWith('http')) return s;
    if (s.startsWith('/')) return s;
    if (s.startsWith('public/storage/'))
      return '/' + s.replace(/^public\//, '');
    if (s.startsWith('storage/'))
      return '/' + s;

    return '/storage/' + s;
  };

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setItems(list.slice(0, 4));
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="bg-[#F6F6F6] mt-7">
      <div className="flex flex-col justify-center items-center py-10 sm:py-15 px-4">
        <h1 className="font-bold text-[28px] sm:text-[42px] text-center">Feature Products</h1>
        <div className="mx-auto w-40 sm:w-52 h-1 bg-[#FFB600]" />
      </div>
      {/* Feature Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-center gap-6 px-4 sm:px-6'>
        {items.map((p) => (
          <ProductCard
            key={p.product_id}
            image={normalizeImageUrl(p.product_image)}
            name={p.product_name}
            description={p.product_description}
            price={p.product_price}
            stock={p.product_stock}
          />
        ))}
      </div>
      <div className='mt-8 flex justify-center items-center'>
        <div className='bg-[#9C0306] w-55 h-10 rounded-[20px] flex justify-center items-center hover:cursor-pointer'>
          <Link to="/Products" className='text-white text-[16px] font-semibold hover:cursor-pointer'>SEE MORE PRODUCTS</Link>
        </div>
      </div>
    </div>
  );
}
