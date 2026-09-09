import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DiscountedProducts from '../../assets/images/um2.jpg';
import DiscountedProducts1 from '../../assets/images/um3.jpg';
import UMESTE from '../../assets/images/UMESTE.png';

export default function DiscountedProduct() {
    const Images = [
        DiscountedProducts,
        DiscountedProducts1,
    ];
    const [current, setCurrent] = useState(0);
    const startXRef = useRef<number | null>(null);
    const draggingRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % Images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [Images.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        draggingRef.current = true;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!draggingRef.current) return;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - (startXRef.current ?? 0);
        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                setCurrent((current + 1) % Images.length);
            } else {
                setCurrent((current - 1 + Images.length) % Images.length);
            }
        }
        draggingRef.current = false;
    };
    const handleMouseDown = (e: React.MouseEvent) => {
        startXRef.current = e.clientX;
        draggingRef.current = true;
    };
    const handleMouseUp = (e: React.MouseEvent) => {
        if (!draggingRef.current) return;
        const endX = e.clientX;
        const diff = endX - (startXRef.current ?? 0);
        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                setCurrent((current + 1) % Images.length);
            } else {
                setCurrent((current - 1 + Images.length) % Images.length);
            }
        }
        draggingRef.current = false;
    };

    return (
        <div className='flex flex-col justify-center items-center'>
            <img src={UMESTE} alt="UMESTE" className='w-auto h-150'/>
            <div className='absolute items-center justify-center'>
                <div className='relative transform translate-y-[250px]'>
                    <div className='flex flex-row justify-center items-center gap-3'>
                        <div className='bg-[#C3C3C3] border border-[#C3C3C3] w-15 h-3 rounded-2xl hover:bg-[#9C0306] hover: transition-colors duration-200'></div>
                        <div className='bg-[#C3C3C3] border border-[#C3C3C3] w-15 h-3 rounded-2xl hover:bg-[#9C0306] hover: transition-colors duration-200'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
