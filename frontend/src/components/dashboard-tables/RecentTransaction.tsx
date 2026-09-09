import React, { useState } from 'react';

interface Transaction {
  customer: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  orderId: string;
  amount: number;
}

interface RecentTransactionProps {
  recentTransactions: Transaction[];
}

export default function RecentTransaction({ recentTransactions }: RecentTransactionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(recentTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = recentTransactions.slice(startIndex, endIndex);

  return (
    <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Transaction</h3>
        <a href="/admin/transaction" className="text-sm text-gray-500">View all &gt;</a>
      </div>

      <div className="grid grid-cols-4 text-sm text-gray-500 pb-3 border-b border-gray-200">
        <div>Customer</div>
        <div>Status</div>
        <div>Order ID</div>
        <div className="text-right">Amount</div>
      </div>

      <div className="divide-y divide-gray-100">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((transaction, index) => (
            <div key={index} className="grid grid-cols-4 py-3 items-center text-sm">
              <div className="flex items-center">
                <span>{transaction.customer}</span>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'Completed'
                  ? 'bg-green-100 text-green-700'
                  : transaction.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {transaction.status}
                </span>
              </div>
              <div>{transaction.orderId}</div>
              <div className="text-right font-semibold text-red-700">
                ₱{transaction.amount?.toLocaleString() || 0}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            No recent transactions
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <>
          <div className="border-t border-gray-200 mt-4" />
          <div className="py-4 flex items-center justify-center gap-7 text-sm font-semibold">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${page === currentPage
                  ? 'text-[#9C0306]'
                  : 'text-gray-900 hover:text-[#9C0306]'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
