import { Link, useLocation } from 'react-router-dom';

export default function OrdersNav() {
  const location = useLocation();

  const tabs = [
    { label: 'All', path: '/Orders' },
    { label: 'To Pay', path: '/ToPay' },
    { label: 'To Receive', path: '/ToReceive' },
    { label: 'Completed', path: '/Completed' },
    { label: 'Cancelled', path: '/Cancelled' },
  ];

  return (
    <div className="flex flex-row justify-center gap-6 sm:gap-8 py-4 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`text-[14px] sm:text-[16px] font-semibold px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
            location.pathname === tab.path
              ? 'text-[#9C0306] border-[#9C0306]'
              : 'text-[#727272] border-transparent hover:text-[#9C0306]'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
