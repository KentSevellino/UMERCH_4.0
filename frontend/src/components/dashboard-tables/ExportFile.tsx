import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Stats {
  todayEarnings: number;
  todayProducts: number;
  totalSalesAmount: number;
  totalUsers: number;
}

interface WeeklyStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  sales: number;
  salesChange: number;
}

interface SalesOverviewItem {
  label: string;
  value: number;
}

interface Transaction {
  customer: string;
  status: string;
  order_id: string;
  amount: number;
  date: string;
}

interface InventoryStatus {
  lowStock: number;
  lowStockPercent: number;
  outOfStock: number;
  outOfStockPercent: number;
  inStock: number;
  inStockPercent: number;
}

interface TopProduct {
  rank: number;
  name: string;
  category: string;
  quantity: number;
  sales: number;
}

interface ExportFileProps {
  stats: Stats;
  weeklyStats: WeeklyStats;
  salesOverview: SalesOverviewItem[];
  recentTransactions: Transaction[];
  inventoryStatus: InventoryStatus;
  topProducts: TopProduct[];
}

export default function ExportFile({
  stats,
  weeklyStats,
  salesOverview,
  recentTransactions,
  inventoryStatus,
  topProducts,
}: ExportFileProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const exportButton = document.querySelector('[data-export-menu]');
      if (exportButton && !exportButton.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  const exportAllToExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['DASHBOARD SUMMARY REPORT'],
        ['Generated Date', new Date().toLocaleDateString()],
        [],
        ['METRICS', 'VALUE'],
        ['Today Earnings', `₱${stats.todayEarnings?.toLocaleString() || 0}`],
        ['Today Products', stats.todayProducts || 0],
        ['Total Sales', `₱${stats.totalSalesAmount?.toLocaleString() || 0}`],
        ['Total Users', stats.totalUsers || 0],
        ['Weekly Revenue', `₱${weeklyStats.revenue?.toLocaleString() || 0}`],
        ['Weekly Orders', weeklyStats.orders || 0],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      const dailySalesData = [
        ['DAILY SALES REPORT'],
        ['Date', 'Sales Amount'],
        ...salesOverview.map(s => [s.label, `₱${s.value?.toLocaleString() || 0}`])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(dailySalesData);
      ws2['!cols'] = [{ wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Daily Sales');

      const weeklySalesData = [
        ['WEEKLY SALES REPORT'],
        ['Metric', 'Value', 'Change %'],
        ['Revenue', `₱${weeklyStats.revenue?.toLocaleString() || 0}`, `${weeklyStats.revenueChange}%`],
        ['Orders', weeklyStats.orders || 0, `${weeklyStats.ordersChange}%`],
        ['Sales', `₱${weeklyStats.sales?.toLocaleString() || 0}`, `${weeklyStats.salesChange}%`],
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(weeklySalesData);
      ws3['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Weekly Sales');

      const yearlySalesData = [
        ['YEARLY SALES REPORT'],
        ['Period', 'Total Sales', 'Total Orders', 'Total Revenue'],
        ['Current Year', `₱${stats.totalSalesAmount?.toLocaleString() || 0}`, stats.todayProducts || 0, `₱${weeklyStats.revenue?.toLocaleString() || 0}`],
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(yearlySalesData);
      ws4['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Yearly Sales');

      const transactionLogsData = [
        ['TRANSACTION LOGS'],
        ['Customer', 'Status', 'Order ID', 'Amount', 'Date'],
        ...recentTransactions.map(t => [
          t.customer || 'N/A',
          t.status || 'N/A',
          t.order_id || 'N/A',
          `₱${t.amount?.toLocaleString() || 0}`,
          t.date || new Date().toLocaleDateString()
        ])
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(transactionLogsData);
      ws5['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws5, 'Transaction Logs');

      const inventoryData = [
        ['INVENTORY RECORDS'],
        ['Status', 'Count', 'Percentage'],
        ['Low Stock', inventoryStatus.lowStock || 0, `${inventoryStatus.lowStockPercent || 0}%`],
        ['Out of Stock', inventoryStatus.outOfStock || 0, `${inventoryStatus.outOfStockPercent || 0}%`],
        ['In Stock', inventoryStatus.inStock || 0, `${inventoryStatus.inStockPercent || 0}%`],
      ];
      const ws6 = XLSX.utils.aoa_to_sheet(inventoryData);
      ws6['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws6, 'Inventory Records');

      const topProductsData = [
        ['TOP PRODUCTS RECORD'],
        ['Rank', 'Product Name', 'Category', 'Stocks', 'Sales'],
        ...topProducts.map(p => [
          p.rank || 'N/A',
          p.name || 'N/A',
          p.category || 'N/A',
          p.quantity || 0,
          `₱${p.sales?.toLocaleString() || 0}`
        ])
      ];
      const ws7 = XLSX.utils.aoa_to_sheet(topProductsData);
      ws7['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws7, 'Top Products');

      const dateStr = new Date().toISOString().split('T')[0];

      const transactionSummaryData: (string | number)[][] = [
        ['RECENT TRANSACTIONS SUMMARY'],
        [],
        ['Total Transactions', recentTransactions.length],
        ['Pending Orders', recentTransactions.filter(t => t.status === 'Pending').length],
        ['Completed Orders', recentTransactions.filter(t => t.status === 'Completed').length],
        ['Cancelled Orders', recentTransactions.filter(t => t.status === 'Cancelled').length],
        [],
        ['DETAILED TRANSACTION LIST'],
        ['#', 'Customer', 'Status', 'Order ID', 'Amount', 'Date']
      ];

      recentTransactions.forEach((t, idx) => {
        transactionSummaryData.push([
          idx + 1,
          t.customer || 'N/A',
          t.status || 'N/A',
          t.order_id || 'N/A',
          `₱${t.amount?.toLocaleString() || 0}`,
          t.date || new Date().toLocaleDateString()
        ]);
      });

      const wsSummary = XLSX.utils.aoa_to_sheet(transactionSummaryData);
      wsSummary['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Transaction Summary');

      const salesMetricsData: (string | number)[][] = [
        ['SALES & METRICS REPORT'],
        [],
        ['KEY PERFORMANCE INDICATORS'],
        ['Metric', 'Value'],
        ['Today Earnings', `₱${stats.todayEarnings?.toLocaleString() || 0}`],
        ['Today Products', stats.todayProducts || 0],
        ['Total Sales', `₱${stats.totalSalesAmount?.toLocaleString() || 0}`],
        ['Total Users', stats.totalUsers || 0],
        [],
        ['WEEKLY PERFORMANCE'],
        ['Metric', 'Value', 'Change %'],
        ['Revenue', `₱${weeklyStats.revenue?.toLocaleString() || 0}`, `${weeklyStats.revenueChange}%`],
        ['Orders', weeklyStats.orders || 0, `${weeklyStats.ordersChange}%`],
        ['Sales', `₱${weeklyStats.sales?.toLocaleString() || 0}`, `${weeklyStats.salesChange}%`],
        [],
        ['DAILY SALES BREAKDOWN'],
        ['Date', 'Sales Amount']
      ];

      salesOverview.forEach(s => {
        salesMetricsData.push([s.label, `₱${s.value?.toLocaleString() || 0}`]);
      });

      const wsMetrics = XLSX.utils.aoa_to_sheet(salesMetricsData);
      wsMetrics['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsMetrics, 'Sales & Metrics');

      XLSX.writeFile(wb, `Complete_Reports_${dateStr}.xlsx`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const exportAllToPDF = async () => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      const addSection = (title: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 15;
        }
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 15, yPosition);
        yPosition += 10;
      };

      const addSimpleTable = (headers: string[], rows: (string | number)[][]) => {
        const colWidth = (pageWidth - 30) / headers.length;
        let xPosition = 15;

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setFillColor(200, 200, 200);
        headers.forEach((header) => {
          doc.rect(xPosition, yPosition, colWidth, 7, 'F');
          doc.text(header, xPosition + 2, yPosition + 5);
          xPosition += colWidth;
        });
        yPosition += 8;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setFillColor(245, 245, 245);
        rows.forEach((row, rowIndex) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 15;
          }
          xPosition = 15;
          const isEvenRow = rowIndex % 2 === 0;
          if (isEvenRow) {
            doc.rect(15, yPosition, pageWidth - 30, 6, 'F');
          }
          row.forEach((cell) => {
            const cellText = String(cell).substring(0, 20);
            doc.text(cellText, xPosition + 2, yPosition + 4);
            xPosition += colWidth;
          });
          yPosition += 7;
        });
        yPosition += 3;
      };

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('COMPLETE DASHBOARD REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(10);
      const date = new Date().toLocaleDateString();
      doc.text(`Generated on: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      addSection('SUMMARY');
      const summaryRows = [
        ['Today Earnings', `₱${stats.todayEarnings?.toLocaleString() || 0}`],
        ['Today Products', stats.todayProducts || 0],
        ['Total Sales', `₱${stats.totalSalesAmount?.toLocaleString() || 0}`],
        ['Total Users', stats.totalUsers || 0],
        ['Weekly Revenue', `₱${weeklyStats.revenue?.toLocaleString() || 0}`],
        ['Weekly Orders', weeklyStats.orders || 0],
      ];
      addSimpleTable(['Metric', 'Value'], summaryRows);

      if (salesOverview.length > 0) {
        addSection('DAILY SALES REPORT');
        const dailyRows = salesOverview.map(s => [s.label, `₱${s.value?.toLocaleString() || 0}`]);
        addSimpleTable(['Date', 'Amount'], dailyRows);
      }

      addSection('WEEKLY SALES REPORT');
      const weeklyRows = [
        ['Revenue', `₱${weeklyStats.revenue?.toLocaleString() || 0}`, `${weeklyStats.revenueChange}%`],
        ['Orders', weeklyStats.orders || 0, `${weeklyStats.ordersChange}%`],
        ['Sales', `₱${weeklyStats.sales?.toLocaleString() || 0}`, `${weeklyStats.salesChange}%`],
      ];
      addSimpleTable(['Metric', 'Value', 'Change %'], weeklyRows);

      if (recentTransactions.length > 0) {
        addSection('TRANSACTION LOGS');
        const transactionRows = recentTransactions.slice(0, 15).map(t => [
          (t.customer || 'N/A').substring(0, 15),
          t.status || 'N/A',
          t.order_id || 'N/A',
          `₱${t.amount?.toLocaleString() || 0}`
        ]);
        addSimpleTable(['Customer', 'Status', 'Order ID', 'Amount'], transactionRows);
      }

      addSection('INVENTORY RECORDS');
      const inventoryRows = [
        ['Low Stock', inventoryStatus.lowStock || 0, `${inventoryStatus.lowStockPercent || 0}%`],
        ['Out of Stock', inventoryStatus.outOfStock || 0, `${inventoryStatus.outOfStockPercent || 0}%`],
        ['In Stock', inventoryStatus.inStock || 0, `${inventoryStatus.inStockPercent || 0}%`],
      ];
      addSimpleTable(['Status', 'Count', 'Percentage'], inventoryRows);

      if (topProducts.length > 0) {
        addSection('TOP PRODUCTS RECORD');
        const productsRows = topProducts.map(p => [
          p.rank || 'N/A',
          (p.name || 'N/A').substring(0, 15),
          p.category || 'N/A',
          p.quantity || 0,
          `₱${p.sales?.toLocaleString() || 0}`
        ]);
        addSimpleTable(['Rank', 'Product', 'Category', 'Stocks', 'Sales'], productsRows);
      }

      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`Complete_Reports_${dateStr}.pdf`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again or contact support.');
    }
  };

  return (
    <div className="relative mr-12" data-export-menu>
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        className="px-10 py-2 text-sm rounded-lg bg-red-700 text-white hover:bg-red-800 font-semibold flex items-center gap-2"
        title="Export all reports and logs"
      >
        Export File
      </button>

      {showExportMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-600 px-3 py-2 uppercase">Export Options</div>

            <button
              onClick={exportAllToExcel}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-semibold">Export to Excel</div>
                <div className="text-xs text-gray-500">All reports, logs & sales data</div>
              </div>
            </button>

            <button
              onClick={exportAllToPDF}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded flex items-center gap-2 mt-1"
            >
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-semibold">Export to PDF</div>
                <div className="text-xs text-gray-500">All reports, logs & sales data</div>
              </div>
            </button>

            <div className="border-t border-gray-200 my-2"></div>

            <div className="text-xs text-gray-600 px-3 py-1">
              <div className="font-semibold">Includes:</div>
              <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                <li>✓ Daily, Weekly & Yearly Sales</li>
                <li>✓ Transaction Logs</li>
                <li>✓ Inventory Records</li>
                <li>✓ Top Products Data</li>
                <li>✓ Dashboard Summary</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
