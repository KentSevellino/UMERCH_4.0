import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../../assets/images/um5.jpg';
import LoginLogo from '../../assets/images/UMERCH-LOGIN-LOGO.svg';
import EmailIcon from '../../assets/images/email-icon.svg';
import PasswordIcon from '../../assets/images/password-icon.svg';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { DeviceFingerprint } from '../../utils/DeviceFingerprint';

interface KnowledgeProps {
  showLogin: boolean;
  onCloseLogin: () => void;
}

interface LoginData {
  login: string;
  password: string;
  remember: boolean;
  device_fingerprint: string | null;
}

interface LoginErrors {
  [key: string]: string | undefined;
}

export default function Knowledge({ showLogin, onCloseLogin }: KnowledgeProps) {
  const { user } = useAuth();

  const [data, setData] = useState<LoginData>({
    login: '',
    password: '',
    remember: false,
    device_fingerprint: null,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [processing, setProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Initialize device fingerprint
  useEffect(() => {
    const initializeDeviceFingerprint = async () => {
      try {
        let fingerprint = DeviceFingerprint.getStoredFingerprint();

        if (!fingerprint) {
          fingerprint = await DeviceFingerprint.generateFingerprint();
          DeviceFingerprint.storeFingerprint(fingerprint);
        }

        setData(prev => ({
          ...prev,
          device_fingerprint: fingerprint
        }));

        setCheckingDevice(true);
        try {
          const response = await api.post('/check-trusted-device', {
            fingerprint: fingerprint
          });

          if (response.data.trusted) {
            console.log('Trusted device detected for:', response.data.user_email);
            setData(prev => ({
              ...prev,
              login: response.data.user_email
            }));
          }
        } catch (err: any) {
          console.log('Device check error (non-blocking):', err.message);
        }
      } catch (err: any) {
        console.log('Fingerprint generation error:', err.message);
      } finally {
        setCheckingDevice(false);
      }
    };

    initializeDeviceFingerprint();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({
      ...prev,
      remember: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const response = await api.post('/login', {
        login: data.login,
        password: data.password,
        remember: data.remember,
        device_fingerprint: data.device_fingerprint,
      });

      const { user, token, redirect } = response.data;

      if (token) {
        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      window.location.href = redirect || '/authentication';
    } catch (error: any) {
      if (error.response?.status === 429 && error.response?.data?.retry_after) {
        setLockoutCountdown(error.response.data.retry_after);
        setErrors({ login: error.response.data.errors?.login || 'Account locked.' });
      } else if (error.response?.status === 419) {
        setErrors({ general: 'Session expired. Please refresh and try again.' });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
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
        {showLogin && (
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

                      <div className="flex flex-row items-center w-full mt-4">
                        <input
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={data.remember}
                          onChange={handleChange}
                          className="form-checkbox w-5 text-[#9C0306] bg-white border-gray-300 rounded focus:ring-[#9C0306]"
                        />
                        <label htmlFor="remember" className="ml-2 text-white select-none cursor-pointer text-[14px]">
                          Remember Me
                        </label>
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
