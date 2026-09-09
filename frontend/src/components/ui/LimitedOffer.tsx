import { Link } from 'react-router-dom';
import LimitedOfferImage from '../../assets/images/BG-LIMITED-OFFER.svg';

export default function LimitedOffer() {
    return (
        <div className="bg-[#F6F6F6] flex flex-col px-4 sm:px-10 lg:px-16 py-8">
            <div className="bg-[#9C0306] relative flex flex-row items-center min-h-[10rem] sm:h-100 px-8 sm:px-16 py-8 sm:py-12 overflow-hidden">
                <div className='flex flex-col gap-4 z-10'>
                    <h2 className='text-white text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Cormorant Garamond' }}>LIMITED TIME OFFER!</h2>
                    <h1 className='text-white text-2xl sm:text-3xl font-bold' style={{ fontFamily: 'Cormorant Garamond' }}>SPECIAL EDITION</h1>
                    <Link className='text-[#9C0306] bg-[#FBB600] rounded-[10px] w-32 h-10 flex items-center justify-center font-light text-[14px] leading-tight' to="/Products">
                        SHOP NOW
                    </Link>
                </div>
                <div className='hidden sm:flex ml-auto items-center justify-end h-full'>
                    <img src={LimitedOfferImage} alt="Limited Offer" className='h-full max-h-[400px] object-contain' />
                </div>
            </div>
        </div>
    );
}
