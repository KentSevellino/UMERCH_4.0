import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/images/UMERCH-LOGO.svg';
import DashboardIcon from '../../assets/images/Dashboard-icon.svg';
import TransactionIcon from '../../assets/images/Transaction-icon.svg';
import InventoryIcon from '../../assets/images/Inventory-icon.svg';
import RecordLogsIcon from '../../assets/images/RecordLogs-icon.svg';
import LogoutIcon from '../../assets/images/Logout-icon.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const RED_FILTER = '[filter:brightness(0)_saturate(100%)_invert(11%)_sepia(90%)_saturate(5000%)_hue-rotate(-2deg)_brightness(95%)_contrast(105%)]';

interface NavItemProps {
  href?: string;
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  asButton?: boolean;
}

function NavItem({ href, icon, label, active = false, onClick, asButton }: NavItemProps) {
  const classes = `group w-full flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 ${active ? 'bg-white text-red-700' : 'text-white'}`;
  const iconClass = `h-6 w-6 transition-all duration-200 ${active ? RED_FILTER : ''}`;

  if (asButton) {
    return (
      <button onClick={onClick} className={classes}>
        <img src={icon} alt={label} className={iconClass} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link to={href || '#'} className={classes}>
      <img src={icon} alt={label} className={iconClass} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [recordLogsOpen, setRecordLogsOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-60 bg-[#9C0306] text-white min-h-screen flex flex-col">
      <div className="px-5 py-5 flex flex-col items-center border-b border-red-800">
        <img src={Logo} alt="UMERCH logo" className="h-30 w-auto" />
        <div className="text-2xl font-bold">ADMIN</div>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        <NavItem href="/admin" icon={DashboardIcon} label="Dashboard" active={location.pathname === '/admin'} />

        <NavItem href="/admin/transaction" icon={TransactionIcon} label="Transaction" active={isActive('/admin/transaction')} />

        <div>
          <NavItem
            asButton
            icon={InventoryIcon}
            label="Inventory"
            active={inventoryOpen}
            onClick={() => setInventoryOpen(!inventoryOpen)}
          />
          {inventoryOpen && (
            <div>
              <Link to="/admin/inventory/add" className={`block px-14 py-3 text-sm font-medium transition-all duration-200 ${isActive('/admin/inventory/add') ? 'bg-white text-red-700' : 'text-white'}`}>
                Add Product
              </Link>
              <Link to="/admin/inventory/stock-in" className={`block px-14 py-2 text-sm transition-all duration-200 ${isActive('/admin/inventory/stock-in') ? 'bg-white text-red-700' : 'text-white'}`}>
                Stock In
              </Link>
              <Link to="/admin/inventory/stock-out" className={`block px-14 py-2 text-sm transition-all duration-200 ${isActive('/admin/inventory/stock-out') ? 'bg-white text-red-700' : 'text-white'}`}>
                Stock Out
              </Link>
              <Link to="/admin/inventory/report" className={`block px-14 py-2 text-sm transition-all duration-200 ${isActive('/admin/inventory/report') ? 'bg-white text-red-700' : 'text-white'}`}>
                Report
              </Link>
            </div>
          )}
        </div>

        <div>
          <NavItem
            asButton
            icon={RecordLogsIcon}
            label="Record Logs"
            active={recordLogsOpen}
            onClick={() => setRecordLogsOpen(!recordLogsOpen)}
          />
          {recordLogsOpen && (
            <div>
              <Link to="/admin/record-logs/activity" className={`block px-14 py-3 text-sm font-medium transition-all duration-200 ${isActive('/admin/record-logs/activity') ? 'bg-white text-red-700' : 'text-white'}`}>
                Activity Logs
              </Link>
              <Link to="/admin/record-logs/user" className={`block px-14 py-2 text-sm transition-all duration-200 ${isActive('/admin/record-logs/user') ? 'bg-white text-red-700' : 'text-white'}`}>
                User Logs
              </Link>
              <Link to="/admin/record-logs/inventory" className={`block px-14 py-2 text-sm transition-all duration-200 ${isActive('/admin/record-logs/inventory') ? 'bg-white text-red-700' : 'text-white'}`}>
                Inventory Logs
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-red-800">
          <button onClick={logout} className="group w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-white transition-all duration-200">
            <img src={LogoutIcon} alt="Logout" className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
