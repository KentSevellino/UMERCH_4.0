import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../assets/images/UMERCH-LOGO.svg';
import CartIcon from '../../assets/images/CartIcon.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface LandingNavProps {
  cartCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function LandingNav({ cartCount = 0, searchQuery, onSearchChange }: LandingNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="bg-[#9C0306] sticky top-0 z-50">
      <div className="flex flex-row items-center px-4 sm:px-6 h-16 sm:h-20">
        <img src={Logo} alt="UMERCH LOGO" className="h-8 sm:h-10 w-auto" />

        <div className="hidden md:flex flex-row gap-6 px-8 text-white font-semibold" style={{ fontFamily: 'Montserrat' }}>
          <Link to="/Landing" className={`text-[16px] leading-tight ${isActive('/Landing') ? 'text-[#FFB600]' : ''}`}>HOME</Link>
          <Link to="/Shop" className={`text-[16px] leading-tight ${isActive('/Shop') ? 'text-[#FFB600]' : ''}`}>SHOP</Link>
          <Link to="/Orders" className={`text-[16px] leading-tight ${isActive('/Orders') ? 'text-[#FFB600]' : ''}`}>ORDERS</Link>
        </div>

        <div className="hidden md:flex flex-row items-center gap-4 ml-auto text-white" style={{ fontFamily: 'Montserrat' }}>
          {searchQuery !== undefined && (
            <div className="flex flex-row items-center gap-2 border border-white/30 rounded px-2 py-1">
              <img src={SearchIcon} alt="Search" className="w-4 h-4 opacity-70" />
              <input
                type="text"
                placeholder="Search..."
                className="border-none outline-none bg-transparent text-white text-sm placeholder:text-white/50 w-40"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          <Link to="/Cart" className="relative">
            <img src={CartIcon} alt="Cart" className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FFB600] text-[#9C0306] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">{user?.user_fullname}</span>
            <button onClick={logout} className="text-xs text-white/70 hover:text-white bg-transparent border-none cursor-pointer">
              Logout
            </button>
          </div>
        </div>

        <div className="flex md:hidden ml-auto items-center gap-3">
          <Link to="/Cart" className="relative">
            <img src={CartIcon} alt="Cart" className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FFB600] text-[#9C0306] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="text-white focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden flex flex-col bg-[#7a0205] text-white font-bold text-[15px]" style={{ fontFamily: 'Montserrat' }}>
          <Link to="/Landing" className={`px-6 py-3 border-b border-[#9C0306] ${isActive('/Landing') ? 'text-[#FFB600]' : ''}`} onClick={() => setMobileOpen(false)}>HOME</Link>
          <Link to="/Shop" className={`px-6 py-3 border-b border-[#9C0306] ${isActive('/Shop') ? 'text-[#FFB600]' : ''}`} onClick={() => setMobileOpen(false)}>SHOP</Link>
          <Link to="/Orders" className={`px-6 py-3 border-b border-[#9C0306] ${isActive('/Orders') ? 'text-[#FFB600]' : ''}`} onClick={() => setMobileOpen(false)}>ORDERS</Link>
          <button onClick={() => { logout(); setMobileOpen(false); }} className="px-6 py-3 text-left border-b border-[#9C0306]">LOGOUT</button>
        </div>
      )}
    </div>
  );
}
