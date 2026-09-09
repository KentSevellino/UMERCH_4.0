import { useState, useEffect } from 'react';
import LandingNav from '../components/layouts/LandingNav';
import Footer from '../components/layouts/Footer';
import api from '../services/api';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <LandingNav />
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="py-8 px-4">
          <h1 className="text-3xl font-bold text-[#9C0306] text-center mb-8">Shop</h1>
          {loading ? (
            <p className="text-center text-[#727272]">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 lg:px-10">
              {products.map((p: Record<string, unknown>) => (
                <div key={String(p.product_id)} className="bg-white rounded-lg shadow p-4">
                  <div className="h-40 bg-gray-100 rounded mb-2 flex items-center justify-center">
                    {p.product_image ? (
                      <img src={String(p.product_image)} alt={String(p.product_name)} className="h-full object-cover rounded" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{String(p.product_name)}</h3>
                  <p className="text-[#9C0306] font-bold">P{Number(p.product_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
