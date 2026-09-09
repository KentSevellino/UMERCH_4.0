import Navbar from '../components/layouts/Navbar';
import Footer from '../components/layouts/Footer';

export default function AboutUsPage() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-[#F6F6F6] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#9C0306] text-center mb-8">About Us</h1>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-[#727272] leading-relaxed mb-4">
              UMerch is the official merchandise platform of the University of Mindanao.
              We offer a wide range of university-branded products including clothing,
              accessories, and more.
            </p>
            <p className="text-[#727272] leading-relaxed">
              Our mission is to provide high-quality merchandise that represents the
              pride and spirit of the University of Mindanao community.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
