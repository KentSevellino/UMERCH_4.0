import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/layouts/LandingNav';
import Knowledge from '../components/ui/Knowledge';
import Advertisement from '../components/ui/Advertisement';
import DiscountedProduct from '../components/ui/DiscountedProduct';
import FeatureProducts from '../components/ui/FeatureProducts';
import LimitedOffer from '../components/ui/LimitedOffer';
import Accessories from '../components/ui/Accessories';
import FeatureSection from '../components/ui/FeatureSection';
import Hero from '../components/ui/Hero';
import Footer from '../components/layouts/Footer';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('popup')) {
        setShowLogin(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const tryProcessPendingBuy = async () => {
      try {
        const pendingRaw = sessionStorage.getItem('pendingBuy');
        if (!pendingRaw) return;
        const pending = JSON.parse(pendingRaw);
        if (!user) return;

        await api.post('/cart/add', pending);
        sessionStorage.removeItem('pendingBuy');
        navigate('/Checkout');
      } catch (e) {
        console.error('Failed to process pending buy', e);
      }
    };

    tryProcessPendingBuy();
  }, [user, navigate]);

  return (
    <>
      <LandingNav onShowLogin={() => setShowLogin(true)} />
      <Knowledge showLogin={showLogin} onCloseLogin={() => setShowLogin(false)} />
      <Advertisement />
      <DiscountedProduct />
      <FeatureProducts />
      <LimitedOffer />
      <Accessories />
      <FeatureSection />
      <Hero />
      <Footer />
    </>
  );
}
