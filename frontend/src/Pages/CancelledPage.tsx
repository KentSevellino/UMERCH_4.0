import { useState, useEffect } from 'react';
import BackgroundModel from '../assets/images/BackgroundModel.png';
import OrdersNav from '../components/layouts/OrdersNav';
import { normalizeImageUrl } from '../constants';
import Tshirt from '../assets/images/tshirt.jpg';
import LeftArrow from '../assets/images/LeftArrow.svg';
import RightArrow from '../assets/images/RightArrow.svg';
import Navbar from '../components/layouts/LandingNav';
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
    order_items: OrderItem[];
    created_at: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function CancelledPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            const allOrders = Array.isArray(response.data) ? response.data : response.data?.data || [];
            const cancelledOrders = allOrders.filter((order: Order) => order.order_status?.toLowerCase() === 'cancelled');
            setOrders(cancelledOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (orderId: number) => {
        const fileInput = document.getElementById(`file-input-${orderId}`) as HTMLInputElement;
        fileInput?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, orderId: number) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('receipt_form', file);

                await api.post(`/orders/${orderId}/upload-receipt`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                showToast('File uploaded successfully! Moving to To-Pay...', 'success');

                setTimeout(async () => {
                    setLoading(true);
                    await fetchOrders();
                }, 2000);
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Error uploading file. Please try again.';
                showToast(errorMsg, 'error');
            }
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
                <Navbar />
                <div className="bg-[#F6F6F6] flex flex-col min-h-screen">
                    <div className='bg-[#F6F6F6]'>
                        <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
                            <img src={BackgroundModel} alt="Background Model" className='w-full h-full object-cover' />
                        </div>
                    </div>
                    <OrdersNav />
                    <div className="flex flex-col items-center justify-center p-4 py-10">
                        <p>Loading orders...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (orders.length === 0) {
        return (
            <>
                <Navbar />
                <div className="bg-[#F6F6F6] flex flex-col min-h-screen">
                    <div className='bg-[#F6F6F6]'>
                        <div className='w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden'>
                            <img src={BackgroundModel} alt="Background Model" className='w-full h-full object-cover' />
                        </div>
                    </div>
                    <OrdersNav />
                    <div className="flex flex-col items-center justify-center p-4 py-10">
                        <p className="text-gray-500">No cancelled orders</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
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
                    {paginatedOrders.map((order) => (
                        <div key={order.order_id} className="flex flex-col bg-white w-300 h-auto rounded-[10px]">
                            <div className='flex flex-row p-4'>
                                <h1 className='text-[#575757] text-[13px]'>Order ID: {order.order_id}</h1>
                                <div className='ml-auto flex gap-2'>
                                    <h1 className='text-[16px] text-[#9C0306]'>Cancelled</h1>
                                </div>
                            </div>
                            <div className='mt-3'>
                                <div className='bg-[#9C9C9C] w-full h-[1px]'></div>
                            </div>
                            <div className='p-4'>
                                <div className="flex flex-col gap-4">
                                    {order.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex flex-row items-center justify-center gap-2 w-full">
                                            <img src={normalizeImageUrl(item.product?.product_image) || Tshirt} alt={item.product?.product_name} className="w-20 h-20 rounded-[10px] object-cover" />
                                            <div className="flex flex-col items-start justify-center gap-1">
                                                <h1 className="text-[15px] font-semibold">{item.product?.product_name}</h1>
                                                <span className="text-[10px]">{item.variant}</span>
                                                <span className="text-[10px] text-[#9C0306]">x{item.quantity}</span>
                                            </div>
                                            <div className="flex ml-auto items-center justify-center">
                                                <h1 className="text-[13px] text-[#9C0306] font-medium">₱{Number(item.price || 0).toFixed(2)}</h1>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='mt-4 p-4'>
                                <div className='text-center text-[13px] text-[#9C0306] mb-3'>
                                    Due to upload error
                                </div>
                            </div>
                            <div className="py-5 flex flex-row ml-auto items-center gap-5 p-4">
                                <span className="text-[#5C5C5C] text-[13px] font-medium">Order Total:</span>
                                <h1 className="text-[#9C0306] text-[20px] font-medium">₱{Number(order.order_total || 0).toFixed(2)}</h1>
                            </div>
                            <div className='p-4 flex flex-row ml-auto items-center'>
                                <button
                                    onClick={() => handleFileUpload(order.order_id)}
                                    className='w-30 bg-white border border-[#9C0306] text-[#9C0306] text-[14px] py-2 rounded-[10px] hover:cursor-pointer hover:bg-[#9C0306] hover:text-white transition duration-300'>
                                    Reupload File
                                </button>
                                <input
                                    id={`file-input-${order.order_id}`}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileChange(e, order.order_id)}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
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
            </div>
            <Footer />

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl text-white z-[999] font-semibold ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </>
    );
}
