import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../../services/api';

interface AddUsersModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: (user: any) => void;
}

interface PasswordStrength {
  level: '' | 'weak' | 'medium' | 'strong';
  color: string;
  text: string;
}

export default function AddUsersModals({ isOpen, onClose, onUserAdded }: AddUsersModalsProps) {
  const [data, setData] = useState({
    name: '',
    email: '',
    userId: '',
    password: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ level: '', color: '', text: '' });

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { level: '', color: '', text: '' };
    }

    let strength = 0;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (hasLowerCase) strength++;
    if (hasUpperCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;
    if (isLongEnough) strength++;

    if (password.length < 6 || strength <= 2) {
      return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    } else if (password.length >= 6 && strength <= 3) {
      return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    } else {
      return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const response = await api.post('/admin/users', data);
      if (onUserAdded) {
        onUserAdded(response.data.newUser || null);
      }
      setData({ name: '', email: '', userId: '', password: '' });
      setPasswordStrength({ level: '', color: '', text: '' });
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      console.error('Validation errors:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-[#9C0306]">
          <h2 className="text-xl font-semibold text-white">Add New User</h2>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={data.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter full name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              {errors.name && errors.name.toLowerCase().includes('unique') && (
                <p className="text-red-500 text-sm mt-1">This name is already taken.</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={data.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter email address"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              {errors.email && errors.email.toLowerCase().includes('unique') && (
                <p className="text-red-500 text-sm mt-1">This email is already taken.</p>
              )}
            </div>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={data.userId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter user ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter password"
                required
              />

              {/* Password Strength Indicator */}
              {data.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: passwordStrength.level === 'weak' ? '33%' :
                            passwordStrength.level === 'medium' ? '66%' : '100%'
                        }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${passwordStrength.level === 'weak' ? 'text-red-500' :
                      passwordStrength.level === 'medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with a mix of uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}

              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 hover:cursor-pointer">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#9C0306] bg-white border border-[#9C0306] rounded-lg hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-white bg-[#9C0306] border border-transparent rounded-lg hover:cursor-pointer"
            >
              {processing ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
