import AccessoriesCard from '../cards/AccessoriesCard';

export default function Accessories() {
    return (
        <div className="bg-[#F6F6F6] flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center py-10 sm:py-15 px-4">
                <h1 className="font-bold text-[28px] sm:text-[42px] text-center">UM Accessories</h1>
                <div className="mx-auto w-40 sm:w-52 h-1 bg-[#FFB600]" />
            </div>
            <div className="w-full px-4 sm:px-6">
                <AccessoriesCard />
            </div>
        </div>
    );
}
