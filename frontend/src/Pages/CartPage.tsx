import LandingNav from '../components/layouts/LandingNav';
import CartsNav from '../components/layouts/CartsNav';
import Footer from '../components/layouts/Footer';

export default function CartPage() {
  return (
    <div>
      <LandingNav />
      <div className="min-h-screen bg-[#F6F6F6]">
        <CartsNav />
        <div className="py-8 px-4 text-center">
          <p className="text-[#727272]">Your cart is empty</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
