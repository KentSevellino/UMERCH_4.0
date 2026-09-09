import { Link } from 'react-router-dom';
import Location from '../../assets/images/Location.svg';
import Phone from '../../assets/images/Phone.svg';
import Email from '../../assets/images/Email.svg';
import Facebook from '../../assets/images/Facebook.svg';
import Instagram from '../../assets/images/Instagram.svg';
import Twitter from '../../assets/images/Twitter.svg';
import Youtube from '../../assets/images/Youtube.svg';

export default function Footer() {
  return (
    <>
      <div id="footer" className="p-8 bg-[#F6F6F6] flex flex-col justify-center items-center">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-10 sm:gap-16 lg:gap-24">
          <div className="flex flex-col">
            <h1 className="text-[20px]">Menu</h1>
            <div className="mt-1 flex flex-col text-[#727272] gap-1">
              <Link to="/">Home</Link>
              <Link to="/Shop">Shop</Link>
              <Link to="/AboutUs">About us</Link>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px]">Categories</h1>
            <div className="mt-1 flex flex-col text-[#727272] gap-1">
              <span>Wardrobe</span>
              <span>Accessories</span>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px]">Contact Us</h1>
            <div className="mt-1 flex flex-row text-[#727272] gap-2">
              <img src={Location} alt="Location-Icon" className="w-5" />
              <div className="flex flex-col text-start">
                <p>Bolton St, Poblacion District,</p>
                <p>Davao City, 8000 Davao del Sur</p>
              </div>
            </div>
            <div className="mt-1 flex flex-row text-[#727272] gap-2">
              <img src={Email} alt="Email-Icon" className="w-5" />
              <div className="flex flex-col text-start">
                <p>demo@example.com</p>
                <p>info@example.com</p>
              </div>
            </div>
            <div className="mt-1 flex flex-row text-[#727272] gap-2">
              <img src={Phone} alt="Phone-Icon" className="w-5" />
              <div className="flex flex-col text-start">
                <p>01234567890</p>
                <p>01234567890</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px]">Social Media</h1>
            <div className="mt-1 flex flex-row text-[#727272] gap-2">
              <a href="#"><img src={Facebook} alt="Facebook-Icon" /></a>
              <a href="#"><img src={Instagram} alt="Instagram-Icon" /></a>
              <a href="#"><img src={Youtube} alt="Youtube-Icon" /></a>
              <a href="#"><img src={Twitter} alt="Twitter-Icon" /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white flex justify-center items-center">
        <h1 className="text-[#727272] font-medium">Copyright (c) 2025 UMerch | Powered by University of Mindanao</h1>
      </div>
    </>
  );
}
