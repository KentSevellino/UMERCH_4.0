import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import api from '../../services/api';

interface User {
  id: number | string;
  user_fullname?: string;
  email?: string;
  um_id?: string;
}

interface EditUsersModalsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

type FieldErrors = Record<string, string | string[]>;

function fieldError(errs: FieldErrors, key: string): string {
  const value = errs?.[key];
  if (!value) return '';
  return Array.isArray(value) ? value.filter(Boolean).join(' ') : String(value);
}

function normalizeUmId(value: string): string {
  return value.trim().replace(/^0+(?=\d)/, '');
}

export default function EditUsersModals({ isOpen, onClose, user, onSuccess }: EditUsersModalsProps) {
  const [data, setData] = useState({
    user_fullname: '',
    email: '',
    um_id: '',
    user_password: ''
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setData({
        user_fullname: user.user_fullname || '',
        email: user.email || '',
        um_id: String(user.um_id ?? ''),
        user_password: ''
      });
      setErrors({});
      setFormError('');
      setVisible(true);
    } else if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!isOpen && !visible) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (data.user_password && data.user_password.length < 8) {
      setErrors({ user_password: 'Password must be at least 8 characters.' });
      return;
    }

    if (!user || !user.id) {
      alert('No user selected for update');
      return;
    }

    setProcessing(true);
    setErrors({});
    setFormError('');

    try {
      await api.patch(`/admin/users/${user.id}`, {
        ...data,
        um_id: normalizeUmId(data.um_id),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      const body = error.response?.data;
      const fieldErrors = body?.errors ?? {};
      const hasFieldError = ['user_fullname', 'email', 'um_id', 'user_password']
        .some(key => fieldError(fieldErrors, key) !== '');

      console.error('Update user failed:', error.response?.status, body);

      if (hasFieldError) {
        setErrors(fieldErrors);
      } else {
        setFormError(body?.message || 'Unable to update user. Please check the details and try again.');
      }
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
          <h2 className="text-xl font-semibold text-white">Update Users</h2>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="user_fullname" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="user_fullname"
                name="user_fullname"
                value={data.user_fullname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter full name"
                required
              />
              {fieldError(errors, 'user_fullname') && <p className="text-red-500 text-sm mt-1">{fieldError(errors, 'user_fullname')}</p>}
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
              {fieldError(errors, 'email') && <p className="text-red-500 text-sm mt-1">{fieldError(errors, 'email')}</p>}
            </div>

            <div>
              <label htmlFor="um_id" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="um_id"
                name="um_id"
                value={data.um_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Enter user ID"
                required
              />
              {fieldError(errors, 'um_id') && <p className="text-red-500 text-sm mt-1">{fieldError(errors, 'um_id')}</p>}
            </div>
            <div>
              <label htmlFor="user_password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="user_password"
                name="user_password"
                value={data.user_password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-[#9C0306]"
                placeholder="Leave blank to keep current password"
              />
              {fieldError(errors, 'user_password') && <p className="text-red-500 text-sm mt-1">{fieldError(errors, 'user_password')}</p>}
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2">
              <p className="text-red-600 text-sm">{formError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
              {processing ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
