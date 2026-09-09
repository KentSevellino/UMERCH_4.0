import HeroBg from '../../assets/images/model.jpg';

export default function Hero() {
    return (
        <div className='flex flex-col justify-center items-center'>
            <div className='relative w-full'>
                <img src={HeroBg} alt="Hero Background" className='object-cover w-full h-[18rem] sm:h-[24rem] md:h-[30rem]'/>
                <div className='absolute inset-0 bg-black opacity-60'></div>
                <div className='absolute inset-0 bg-amber-300 opacity-16'></div>
                <div className='absolute inset-0 flex flex-col justify-center items-center sm:items-end px-6 sm:pr-12 lg:pr-20'>
                    <div className='flex flex-col text-center sm:text-start text-white w-full sm:w-auto sm:max-w-xl lg:max-w-2xl'>
                        <p className='text-[13px] sm:text-[16px] font-semibold mb-3'>EXPLORE</p>
                        <div className='text-[28px] sm:text-[40px] md:text-[56px] font-semibold' style={{fontFamily: "'Cormorant Garamond', serif"}}>
                            <h1>Elevate your fashion, embrace</h1>
                            <h1>UM Timeless Style!</h1>
                        </div>
                        <div className='text-[12px] sm:text-[14px] font-semibold'>
                            <p>Explore our collections today and experience the joy of fashion.</p>
                            <p>Shop now for the ultimate casual style!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
