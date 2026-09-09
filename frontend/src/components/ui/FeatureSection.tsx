import CampusDelivery from '../../assets/images/CampusDelivery.svg';
import BestQuality from '../../assets/images/BestQuality.svg';
import BestOffer from '../../assets/images/BestOffer.svg';
import SecurePayment from '../../assets/images/SecurePayment.svg';

export default function FeatureSection() {
    return(
        <div className='bg-white'>
            <div className='p-8 sm:p-10 grid grid-cols-2 lg:grid-cols-4 justify-items-center gap-10 sm:gap-16 lg:gap-12'>
                <div className='flex flex-col text-center items-center leading-tight'>
                    <img src={CampusDelivery} alt="Campus Delivery" className='w-16 sm:w-20'/>
                    <h1 className='font-medium text-[18px] sm:text-[20px] mt-3'>Campus Delivery</h1>
                    <p className='mt-5'>Lorem ipsum dolor sit amet</p>
                    <p>consectetur. Eget sed sapien</p>
                    <p>quisque et suspendisse.</p>
                </div>
                <div className='flex flex-col text-center items-center leading-tight'>
                    <img src={BestQuality} alt="Best Quality" className='w-16 sm:w-20'/>
                    <h1 className='font-medium text-[18px] sm:text-[20px] mt-3'>Best Quality</h1>
                    <p className='mt-5'>Lorem ipsum dolor sit amet </p>
                    <p>consectetur. Eget sed sapien</p>
                    <p>quisque et suspendisse.</p>
                </div>
                <div className='flex flex-col text-center items-center leading-tight'>
                    <img src={BestOffer} alt="Best Offer" className='w-16 sm:w-20'/>
                    <h1 className='font-medium text-[18px] sm:text-[20px] mt-3'>Best Offer</h1>
                    <p className='mt-5'>Lorem ipsum dolor sit amet</p>
                    <p>consectetur. Eget sed sapien</p>
                    <p>quisque et suspendisse.</p>
                </div>
                <div className='flex flex-col text-center items-center leading-tight'>
                    <img src={SecurePayment} alt="Secure Payment" className='w-16 sm:w-20'/>
                    <h1 className='font-medium text-[18px] sm:text-[20px] mt-3'>Secure Payment</h1>
                    <p className='mt-5'>Lorem ipsum dolor sit amet</p>
                    <p>consectetur. Eget sed sapien</p>
                    <p>quisque et suspendisse.</p>
                </div> 
            </div>
        </div>
    );
}
