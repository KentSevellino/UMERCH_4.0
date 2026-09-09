import LandingNav from '../components/layouts/LandingNav';
import Footer from '../components/layouts/Footer';

export default function LandingPage() {
  return (
    <div>
      <LandingNav />
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-[#9C0306] mb-4">Welcome to UMerch</h1>
          <p className="text-[#727272]">Your one-stop shop for university merchandise</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
