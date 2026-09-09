import Navbar from '../components/layouts/Navbar';
import Footer from '../components/layouts/Footer';

export default function ProductsPage() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-[#F6F6F6] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#9C0306] text-center mb-8">Our Products</h1>
          <p className="text-center text-[#727272] mb-12">Browse our collection of university merchandise</p>
          {/* Products will be loaded here */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
