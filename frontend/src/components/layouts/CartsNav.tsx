import { Link, useLocation } from 'react-router-dom';

export default function CartsNav() {
  const location = useLocation();

  const tabs = [
    { label: 'Shopping Cart', path: '/Cart' },
    { label: 'Checkout', path: '/Checkout' },
  ];

  return (
    <div className="flex flex-row justify-center gap-8 py-4">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`text-[16px] font-semibold px-4 py-2 border-b-2 transition-colors ${
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
