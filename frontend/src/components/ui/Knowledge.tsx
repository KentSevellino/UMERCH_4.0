import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/images/um5.jpg';
import LoginLogo from '../../assets/images/UMERCH-LOGIN-LOGO.svg';
import EmailIcon from '../../assets/images/email-icon.svg';
import PasswordIcon from '../../assets/images/password-icon.svg';
import { useAuth } from '../../contexts/AuthContext';
import { oauthErrorFromUrl, rememberOauthOrigin } from '../../utils/oauthErrors';
import GoogleGIcon from './GoogleGIcon';
import { formatSignInError } from '../../utils/signInErrors';

const googleAuthUrl = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;

interface KnowledgeProps {
  showLogin: boolean;
  onCloseLogin: () => void;
}

interface LoginData {
  login: string;
  password: string;
}

interface LoginErrors {
  [key: string]: string | undefined;
}

export default function Knowledge({ showLogin, onCloseLogin }: KnowledgeProps) {
  const { login, isPendingVerification, isAuthenticated, isLoading } = useAuth();

  const [data, setData] = useState<LoginData>({
    login: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>(() => {
    const initialError = oauthErrorFromUrl();
    return initialError ? { general: initialError } : {};
  });
  const [processing, setProcessing] = useState(false);
  const [showError, setShowError] = useState(() => oauthErrorFromUrl() !== '');
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  useEffect(() => {
    if (lockoutCountdown > 0 && !showError) {
      setShowError(true);
    }
  }, [lockoutCountdown]);

  useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown(prev => {
        if (prev <= 1) {
          setShowError(false);
          setErrors({});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && !lockoutCountdown) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors, lockoutCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const result = await login(data.login, data.password);
      window.location.href = result.redirect || '/authentication';
    } catch (error: unknown) {
      const safeError = formatSignInError(error);
      setLockoutCountdown(safeError.retryAfter ?? 0);
      setErrors({ general: safeError.message });
      setShowError(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className='relative min-h-screen flex flex-col'>
      {/* Background image */}
      <div className='absolute inset-0 z-0'>
        <img src={BackgroundImage} alt="UM-LOGO" className='w-full h-full object-cover' />
        <div className='absolute inset-0 bg-black opacity-60'></div>
      </div>

      {/* Content */}
      <div className='relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 lg:px-16 min-h-screen py-20 lg:py-0 gap-10'>
        <div className='flex flex-col text-center lg:text-left'>
          <h1 className='font-montserrat text-[16px] text-white'>CASUAL & EVERYDAY</h1>
          <div className='mt-5 font-medium gap-2 text-white text-[44px] sm:text-[56px] lg:text-[70px] leading-tight' style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <h1>Effortlessly combine</h1>
            <h1>comfort with campus style!</h1>
          </div>
          <div className='mt-5 flex flex-col text-white font-montserrat text-[14px] sm:text-[16px] leading-tight'>
            <span>Discover our Casual & Everyday Collection at UMerch, where relaxed designs meet a refined</span>
            <span>university look.</span>
          </div>
          <div className='mt-10 flex justify-center lg:justify-start'>
            <Link to="/Products" className='bg-[#9C0306] text-white text-[16px] px-6 py-3 hover:cursor-pointer hover:bg-[#FFB600] transition-colors duration-300'>SHOP NOW</Link>
          </div>
        </div>

        {/* Login Container */}
        {showLogin && !isPendingVerification && !isAuthenticated && !isLoading && (
          <>
            {/* Mobile backdrop */}
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={onCloseLogin} />

            {/* Fixed modal on mobile, inline panel on desktop */}
            <div
              className='fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto flex items-center justify-center lg:block flex-shrink-0 px-4 lg:px-0'
              onClick={onCloseLogin}
            >
              <div className="w-full max-w-sm lg:w-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                  <div className='relative bg-black/80 lg:bg-black/60 rounded-[15px] p-8 w-full lg:w-96'>
                    <button
                      type="button"
                      className="lg:hidden absolute top-3 right-4 text-white text-2xl font-bold leading-none hover:text-gray-300"
                      onClick={onCloseLogin}
                      aria-label="Close"
                    >×</button>
                    <div className='flex flex-col justify-center items-center'>
                      <div className='flex items-center justify-center'>
                        <img src={LoginLogo} alt="UMERCH Login Logo" className='w-40' />
                      </div>
                      <h1 className='text-white text-[20px] font-bold leading-tight'>LOGIN</h1>

                      {showError && ((lockoutCountdown > 0) || Object.keys(errors).length > 0) && (
                        <div className='p-4 py-2 bg-red-100 border border-red-400 rounded-[10px] mt-2 w-full flex justify-center items-center'>
                          <p className="text-red-700 text-[12px]">
                            {lockoutCountdown > 0
                              ? `Account locked. Try again in ${lockoutCountdown} second(s).`
                              : errors.login || errors.password || errors.email || Object.values(errors)[0]}
                          </p>
                        </div>
                      )}

                      <div className='mt-10 gap-6 flex flex-col w-full'>
                        <div className="relative">
                          <input
                            type="text"
                            name="login"
                            placeholder="UM Email or UM ID"
                            value={data.login}
                            onChange={e => setData(prev => ({ ...prev, login: e.target.value }))}
                            required
                            className='bg-white/30 border rounded-[15px] h-10 w-full pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50'
                          />
                          <img
                            src={EmailIcon}
                            alt="Email Icon"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
                          />
                        </div>

                        <div className='relative'>
                          <input
                            type="password"
                            name="password"
                            placeholder='Password'
                            value={data.password}
                            onChange={e => setData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className='bg-white/30 border rounded-[15px] h-10 w-full pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50'
                          />
                          <img
                            src={PasswordIcon}
                            alt="Password Icon"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
                          />
                        </div>
                      </div>

                      <div className='mt-6 w-full'>
                        <button
                          type="submit"
                          disabled={processing}
                          className="bg-[#9C0306] w-full h-10 text-white text-[16px] rounded-[15px] flex items-center justify-center hover:bg-[#7a0205] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-4 w-full text-white/60 text-[12px]">
                        <div className="flex-1 border-t border-white/20" />
                        <span>or</span>
                        <div className="flex-1 border-t border-white/20" />
                      </div>

                      <div className='mt-4 w-full'>
                        <a
                          href={googleAuthUrl}
                          onClick={() => rememberOauthOrigin('landing')}
                          className="w-full h-10 flex items-center justify-center gap-2 border border-white/40 rounded-[15px] text-white text-[14px] hover:bg-white/10 transition-colors"
                        >
                          <GoogleGIcon size={18} />
                          Sign in with Google
                        </a>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
