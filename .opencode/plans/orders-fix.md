# Fix: "All" Orders Tab Not Showing Orders

## Problem
`OrdersPage.tsx` was a layout wrapper using `<Outlet />` but routes are flat (not nested), so the "All" tab showed an empty page.

## Solution
Rewrite `frontend/src/Pages/OrdersPage.tsx` to be a standalone page that fetches and displays ALL orders.

## Replacement Content for `frontend/src/Pages/OrdersPage.tsx`
Replace the entire file with the content below:

```tsx
import { useState, useEffect } from 'react';
import BackgroundModel from '../assets/images/BackgroundModel.png';
import { normalizeImageUrl } from '../constants';
import OrdersNav from '../components/layouts/OrdersNav';
import Tshirt from '../assets/images/tshirt.jpg';
import LeftArrow from '../assets/images/LeftArrow.svg';
import RightArrow from '../assets/images/RightArrow.svg';
import LandingNav from '../components/layouts/LandingNav';
import Footer from '../components/layouts/Footer';
import api from '../services/api';

interface Product {
    product_image: string | null;
    product_name: string;
}

interface OrderItem {
    product: Product | null;
    variant: string;
    quantity: number;
    price: number;
}

interface Order {
    order_id: number;
    order_status: string;
    order_total: number;
    receipt_form: string | null;
    campus: string | null;
    order_items: OrderItem[];
    created_at: string;
}

function getStatusInfo(status: string): { label: string; color: string } {
    switch (status?.toLowerCase()) {
        case 'pending':
            return { label: 'To Pay', color: 'text-[#9C0306]' };
        case 'processing':
            return { label: 'Preparing', color: 'text-blue-600' };
        case 'out-of-delivery':
            return { label: 'Out for Delivery', color: 'text-orange-600' };
        case 'ready-for-pickup':
            return { label: 'Ready for Pickup', color: 'text-green-600' };
        case 'completed':
            return { label: 'Complete', color: 'text-green-600' };
        case 'cancelled':
            return { label: 'Cancelled', color: 'text-gray-500' };
        default:
            return { label: status || 'Unknown', color: 'text-gray-600' };
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            const orderList = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setOrders(orderList);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const totalItems = orders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <>
                <LandingNav />
                <div className="bg-[#F6F6F6] flex flex-col">
                    <div className='bg-[#F6F6F6]'>
                        <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
                            <img src={BackgroundModel} alt="Background Model" className='w-full h-full object-cover' />
                        </div>
                    </div>
                    <OrdersNav />
                    <div className="flex flex-col items-center justify-center p-4 py-10">
                        <p>Loading orders...</p>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <LandingNav />
            <div className="bg-[#F6F6F6] flex flex-col">
                <div className='bg-[#F6F6F6]'>
                    <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
                        <img src={BackgroundModel} alt="Background Model" className='w-full h-full object-cover' />
                    </div>
                </div>
                <div>
                    <OrdersNav />
                </div>
                <div className="flex flex-col items-center justify-center p-4 py-10 gap-5">
                    {orders.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        paginatedOrders.map((order) => {
                            const statusInfo = getStatusInfo(order.order_status);
                            return (
                                <div key={order.order_id} className='flex flex-col bg-white w-300 h-auto rounded-[10px]'>
                                    <div className='flex flex-row p-4'>
                                        <h1 className='text-[#575757] text-[13px]'>Order ID: {order.order_id || 'N/A'}</h1>
                                        <div className='ml-auto flex'>
                                            <h1 className={`text-[16px] font-semibold ${statusInfo.color}`}>{statusInfo.label}</h1>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <div className='bg-[#9C9C9C] w-full h-[1px]'></div>
                                    </div>
                                    <div className='p-4'>
                                        <div className="flex flex-col gap-4">
                                            {order.order_items && order.order_items.length > 0 ? (
                                                order.order_items.map((item, index) => (
                                                    <div key={index} className="flex flex-row items-center justify-center gap-2 w-full border-b pb-4 last:border-b-0">
                                                        <img
                                                            src={normalizeImageUrl(item.product?.product_image) || Tshirt}
                                                            alt={item.product?.product_name || 'product'}
                                                            className="w-20 h-20 rounded-[10px] object-cover"
                                                        />
                                                        <div className="flex flex-col items-start justify-center gap-1">
                                                            <h1 className="text-[15px] font-semibold">{item.product?.product_name || 'Product'}</h1>
                                                            <span className="text-[10px]">{item.variant || 'N/A'}</span>
                                                            <span className="text-[10px] text-[#9C0306]">x{item.quantity || 1}</span>
                                                        </div>
                                                        <div className="flex ml-auto items-center justify-center">
                                                            <h1 className="text-[13px] text-[#9C0306] font-medium">₱{Number(item.price || 0).toFixed(2)}</h1>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">No items in this order</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='bg-[#9C9C9C] w-full h-[1px]'></div>
                                    </div>
                                    <div className="py-5 flex flex-row ml-auto items-center gap-5 p-4">
                                        <span className="text-[#5C5C5C] text-[13px] font-medium">Order Total:</span>
                                        <h1 className="text-[#9C0306] text-[20px] font-medium">₱{Number(order.order_total || 0).toFixed(2)}</h1>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className='flex flex-row justify-center items-center gap-4 py-10'>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className='px-3 py-1 hover:cursor-pointer disabled:opacity-50'
                        >
                            <img src={LeftArrow} alt="Left Arrow" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 border rounded hover:cursor-pointer ${page === currentPage
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
                )}
            </div>
            <Footer />
        </>
    );
}
```
