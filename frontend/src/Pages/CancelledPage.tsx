import LandingNav from '../components/layouts/LandingNav';
import OrdersNav from '../components/layouts/OrdersNav';
import Footer from '../components/layouts/Footer';

export default function CancelledPage() {
  return (
    <div>
      <LandingNav />
      <div className="min-h-screen bg-[#F6F6F6]">
        <OrdersNav />
        <div className="py-8 px-4 text-center">
          <p className="text-[#727272]">Cancelled orders will appear here</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
