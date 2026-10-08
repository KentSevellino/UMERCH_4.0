import { useRef, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PendingSignInActions from '../components/ui/PendingSignInActions';
import { isAxiosError } from 'axios';
import { censorEmail } from '../utils/censorEmail';

interface AuthenticationPageProps {
    email?: string;
    flash?: {
        status?: string;
    };
}

export default function AuthenticationPage({ email: initialEmail, flash }: AuthenticationPageProps) {
    const { user, status, isAdmin, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const inputLength = 6;
    const [values, setValues] = useState<string[]>(Array(inputLength).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [cooldown, setCooldown] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [expiredError, setExpiredError] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const displayEmail = initialEmail || censorEmail(user?.email || '');

    useEffect(() => {
        const pendingOtp = sessionStorage.getItem('pending_otp');
        if (pendingOtp && pendingOtp.length === inputLength) {
            setValues(pendingOtp.split(''));
            sessionStorage.removeItem('pending_otp');
            setSuccessMessage(`Verification code auto-filled: ${pendingOtp}`);
        }
    }, []);

    useEffect(() => {
        if (flash?.status) {
            setSuccessMessage(flash.status);
            setCooldown(60);
            setOtpError('');
            setExpiredError(false);
            setValues(Array(inputLength).fill(''));
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.status]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        if (otpError) {
            const timer = setTimeout(() => {
                setOtpError('');
                setExpiredError(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [otpError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (!val) {
            setValues((prev) => {
                const arr = [...prev];
                arr[idx] = '';
                return arr;
            });
            return;
        }
        setValues((prev) => {
            const arr = [...prev];
            arr[idx] = val[0];
            return arr;
        });
        if (val && idx < inputLength - 1) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        if (!paste) return;
        const arr = paste.split('').slice(0, inputLength);
        setValues((prev) => {
            const newArr = [...prev];
            arr.forEach((char, i) => {
                newArr[i] = char;
            });
            return newArr;
        });
        setTimeout(() => {
            const nextIdx = arr.length < inputLength ? arr.length : inputLength - 1;
            inputsRef.current[nextIdx]?.focus();
        }, 0);
        e.preventDefault();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !values[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = values.join('');
        if (otp.length !== 6) {
            return;
        }
        setIsVerifying(true);
        setExpiredError(false);
        setOtpError('');

        try {
            const response = await verifyOtp(otp);
            navigate(response.redirect || '/Landing', { replace: true });
        } catch (error: unknown) {
            const knownErrors = ['The OTP has expired. Please request a new one.', 'Too many failed attempts. Please request a new OTP.', 'Invalid OTP.'];
            const message = isAxiosError(error) ? error.response?.data?.message : null;
            const errorMsg = knownErrors.includes(message) ? message : 'Unable to verify your code. Please try again.';
            setOtpError(errorMsg);
            if (errorMsg.toLowerCase().includes('expired')) {
                setExpiredError(true);
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (cooldown === 0) {
            setIsResending(true);
            try {
                const res = await resendOtp();
                setCooldown(60);
                if (res?.otp) {
                    const otpStr = String(res.otp);
                    setValues(otpStr.split(''));
                    setSuccessMessage(`New code: ${otpStr}`);
                } else {
                    setSuccessMessage('OTP sent successfully');
                }
                setOtpError('');
                setExpiredError(false);
                setValues(Array(inputLength).fill(''));
                setTimeout(() => setSuccessMessage(''), 5000);
            } catch {
                setOtpError('Unable to send your verification code. Please try again.');
            } finally {
                setIsResending(false);
            }
        }
    };

    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'guest') return <Navigate to="/login" replace />;
    if (status === 'verified') return <Navigate to={isAdmin ? '/admin' : '/Landing'} replace />;

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <PendingSignInActions showResume={false} />
            <h1 className="text-[34px] font-medium">Verification</h1>
            <div className="text-[20px] py-2">
                <p>A verification code has been sent to</p>
                <p>{displayEmail}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center mt-6">
                <div className="flex flex-row gap-6">
                    {values.map((val, idx) => (
                        <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            className="border-0 w-10 border-b-2 border-gray-400 text-center focus:outline-none focus:border-b-[#9C0306]"
                            value={val}
                            onChange={(e) => handleChange(e, idx)}
                            onPaste={handlePaste}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            ref={el => { inputsRef.current[idx] = el; }}
                        />
                    ))}
                </div>
                <div className="flex flex-row text-[16px] gap-2 mt-7">
                    <button
                        type="button"
                        className="text-[#9C0306] font-medium hover:cursor-pointer"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isResending}
                    >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                    </button>
                </div>
                {otpError && (
                    <div className="mt-4 text-[#9C0306] text-center">
                        <p>{otpError}</p>
                        {expiredError && (
                            <p className="mt-2 text-sm font-medium">
                                Please request a new verification code.
                            </p>
                        )}
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 text-green-600 text-center">
                        <p>{successMessage}</p>
                    </div>
                )}
                <div className="mt-7 flex justify-center items-center">
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="bg-[#9C0306] text-white rounded-[20px] w-40 h-8 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                </div>
            </form>
        </div>
    );
}
