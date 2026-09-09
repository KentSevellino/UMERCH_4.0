import Tumbler from '../../assets/images/tumbler-wood.jpg';
import RegularTumbler from '../../assets/images/tumbler.png';
import Mugs from '../../assets/images/mug.png';
import Notebooks from '../../assets/images/notebook.png';

export default function AccessoriesCard() {
    return (
        <div className="flex flex-col mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
                <div className="flex flex-col">
                    <img src={Tumbler} alt="Accessories" className="h-48 sm:h-64 md:h-80 w-full object-contain"/>
                    <div className="mt-2">
                        <h1 className="font-semibold text-[14px] sm:text-[16px]">UM Wooden<br/>Tumbler</h1>
                    </div>
                </div>
                <div className="flex flex-col">
                    <img src={RegularTumbler} alt="Accessories" className="h-48 sm:h-64 md:h-80 w-full object-contain"/>
                    <div className="mt-2">
                        <h1 className="font-semibold text-[14px] sm:text-[16px]">UM Regular<br/>Tumbler</h1>
                    </div>
                </div>
                <div className="flex flex-col">
                    <img src={Mugs} alt="Accessories" className="h-48 sm:h-64 md:h-80 w-full object-contain"/>
                    <div className="mt-2">
                        <h1 className="font-semibold text-[14px] sm:text-[16px]">UM Mug | Wildcats</h1>
                    </div>
                </div>
                <div className="flex flex-col">
                    <img src={Notebooks} alt="Accessories" className="h-48 sm:h-64 md:h-80 w-full object-contain"/>
                    <div className="mt-2">
                        <h1 className="font-semibold text-[14px] sm:text-[16px]">UM Notebook</h1>
                    </div>
                </div>
            </div>
        </div>    
    );
}
