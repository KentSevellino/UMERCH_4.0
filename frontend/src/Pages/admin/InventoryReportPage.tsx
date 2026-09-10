import { useState, useEffect } from "react";
import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import api from '../../services/api';

interface ReportRow {
  date_range: { display: string };
  product_name: string;
  status: string;
  variant_type: string;
  unit_price: number;
  sold_qty: number;
  sold_value: number;
  stock_decrease: number;
  purchased_qty: number;
  purchased_value: number;
  current_stock: number;
}

interface Totals {
  sold_qty: number;
  purchased_qty: number;
  sold_value: number;
  purchased_value: number;
}

export default function InventoryReportPage() {
  const [filterType, setFilterType] = useState("day");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    sold_qty: 0,
    purchased_qty: 0,
    sold_value: 0,
    purchased_value: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/inventory-report", {
        params: { filterType, filterDate },
      });
      setReportData(response.data.data || []);
      setTotals({
        sold_qty: response.data.total_sold_qty || 0,
        purchased_qty: response.data.total_purchased_qty || 0,
        sold_value: response.data.total_sold_value || 0,
        purchased_value: response.data.total_purchased_value || 0,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to fetch report data. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    setCurrentPage(1);
  }, [filterType, filterDate]);

  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = reportData.slice(startIndex, endIndex);

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/admin/inventory-report/export-csv", {
        params: { filterType, filterDate },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch {
      setError("Failed to export CSV. Please try again.");
    }
  };

  const handleExportExcel = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "UMERCH Admin";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Inventory Report", {
        pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
      });

      sheet.columns = [
        { key: "date", width: 20 },
        { key: "name", width: 30 },
        { key: "status", width: 12 },
        { key: "variant", width: 14 },
        { key: "price", width: 14 },
        { key: "sold_qty", width: 12 },
        { key: "sold_val", width: 16 },
        { key: "decrease", width: 14 },
        { key: "purch_qty", width: 14 },
        { key: "purch_val", width: 16 },
        { key: "stock", width: 14 },
      ];

      const totalCols = sheet.columns.length;
      const DARK_RED = "FF9C0306";
      const MID_RED = "FFB71C1C";
      const LIGHT_RED = "FFFCE4EC";
      const ALT_ROW = "FFFFF8F8";
      const WHITE = "FFFFFFFF";
      const DARK_TEXT = "FF1A1A1A";
      const WHITE_TEXT = "FFFFFFFF";
      const GRAY_FILL = "FFF5F5F5";

      const addBanner = (text: string, rowNum: number, bgColor: string, fontColor: string, fontSize: number, bold = true) => {
        sheet.mergeCells(rowNum, 1, rowNum, totalCols);
        const row = sheet.getRow(rowNum);
        const cell = row.getCell(1);
        cell.value = text;
        cell.font = { name: "Calibri", bold, size: fontSize, color: { argb: fontColor } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        row.height = fontSize * 2.4;
      };

      addBanner("UMERCH — INVENTORY REPORT", 1, DARK_RED, WHITE_TEXT, 18);

      const periodLabel = reportData.length > 0
        ? `Period: ${reportData[0].date_range.display}  |  Generated: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`
        : `Generated: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`;
      addBanner(periodLabel, 2, MID_RED, WHITE_TEXT, 11, false);

      sheet.getRow(3).height = 6;

      const headers = ["Date / Period", "Product Name", "Status", "Variant", "Unit Price", "Sold Qty", "Sold Value", "Stock Decrease", "Purchased Qty", "Purchased Value", "Current Stock"];
      const headerRow = sheet.getRow(4);
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { name: "Calibri", bold: true, size: 11, color: { argb: WHITE_TEXT } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_RED } };
        cell.alignment = { horizontal: i >= 4 ? "right" : "left", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFEEEEEE" } },
          bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
          left: { style: "thin", color: { argb: "FFEEEEEE" } },
          right: { style: "thin", color: { argb: "FFEEEEEE" } },
        };
      });
      headerRow.height = 28;

      reportData.forEach((row, idx) => {
        const isAlt = idx % 2 === 1;
        const fill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: isAlt ? ALT_ROW : WHITE } };
        const border = {
          top: { style: "hair" as const, color: { argb: "FFDDDDDD" } },
          bottom: { style: "hair" as const, color: { argb: "FFDDDDDD" } },
          left: { style: "hair" as const, color: { argb: "FFDDDDDD" } },
          right: { style: "hair" as const, color: { argb: "FFDDDDDD" } },
        };

        const r = sheet.addRow({
          date: row.date_range.display,
          name: row.product_name,
          status: row.status === "active" ? "Active" : "Archived",
          variant: row.variant_type || "-",
          price: row.unit_price,
          sold_qty: row.sold_qty,
          sold_val: row.sold_value,
          decrease: row.stock_decrease,
          purch_qty: row.purchased_qty,
          purch_val: row.purchased_value,
          stock: row.current_stock,
        });

        r.eachCell((cell, colNum) => {
          cell.fill = fill;
          cell.border = border;
          cell.font = { name: "Calibri", size: 10, color: { argb: DARK_TEXT } };
          cell.alignment = { horizontal: colNum >= 5 ? "right" : "left", vertical: "middle" };
          if ([5, 7, 10].includes(colNum)) cell.numFmt = '"₱"#,##0.00';
          if (colNum === 3) {
            cell.font = {
              name: "Calibri", size: 10, bold: true,
              color: { argb: row.status === "active" ? "FF1B5E20" : "FF616161" },
            };
          }
          if ([6, 7].includes(colNum)) {
            cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF9C0306" } };
          }
          if ([9, 10].includes(colNum)) {
            cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF1B5E20" } };
          }
        });
        r.height = 20;
      });

      const spacer = sheet.addRow([]);
      spacer.height = 6;

      const totalsRow = sheet.addRow({
        date: "TOTALS",
        name: "",
        status: "",
        variant: "",
        price: "",
        sold_qty: totals.sold_qty,
        sold_val: totals.sold_value,
        decrease: totals.sold_qty,
        purch_qty: totals.purchased_qty,
        purch_val: totals.purchased_value,
        stock: "",
      });

      totalsRow.eachCell((cell, colNum) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRAY_FILL } };
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: DARK_TEXT } };
        cell.alignment = { horizontal: colNum >= 5 ? "right" : "left", vertical: "middle" };
        cell.border = {
          top: { style: "medium", color: { argb: DARK_RED } },
          bottom: { style: "medium", color: { argb: DARK_RED } },
        };
        if ([7, 10].includes(colNum)) cell.numFmt = '"₱"#,##0.00';
      });
      totalsRow.height = 24;

      const totalsLabelCell = totalsRow.getCell(1);
      totalsLabelCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: WHITE_TEXT } };
      totalsLabelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK_RED } };
      sheet.mergeCells(totalsRow.number, 1, totalsRow.number, 4);

      const footerRowNum = totalsRow.number + 2;
      sheet.mergeCells(footerRowNum, 1, footerRowNum, totalCols);
      const footerCell = sheet.getRow(footerRowNum).getCell(1);
      footerCell.value = "This report is system-generated by UMERCH. For internal use only.";
      footerCell.font = { name: "Calibri", italic: true, size: 9, color: { argb: "FF999999" } };
      footerCell.alignment = { horizontal: "center" };

      sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 4, showGridLines: true }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export Excel. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      <div className="flex-1 px-10 py-10 flex flex-col">
        <div className="flex-1">
        <h1 className="text-4xl font-extrabold tracking-[0.25em] mb-1">INVENTORY REPORT</h1>
        <p className="text-gray-500 mb-8">View inventory movement and generate reports.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#9C0306] text-white rounded-xl px-6 py-5 flex flex-col gap-1 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Sold Qty</p>
            <p className="text-3xl font-extrabold">{totals.sold_qty}</p>
          </div>
          <div className="bg-[#9C0306] text-white rounded-xl px-6 py-5 flex flex-col gap-1 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Sold Value</p>
            <p className="text-3xl font-extrabold">₱{Number(totals.sold_value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-[#5C975A] text-white rounded-xl px-6 py-5 flex flex-col gap-1 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Purchased Qty</p>
            <p className="text-3xl font-extrabold">{totals.purchased_qty}</p>
          </div>
          <div className="bg-[#5C975A] text-white rounded-xl px-6 py-5 flex flex-col gap-1 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Purchased Value</p>
            <p className="text-3xl font-extrabold">₱{Number(totals.purchased_value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Filter Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-transparent"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                {filterType === "month" ? "Month" : "Date"}
              </label>
              <input
                type={filterType === "month" ? "month" : "date"}
                value={filterType === "month" ? filterDate.slice(0, 7) : filterDate}
                onChange={(e) => setFilterDate(filterType === "month" ? e.target.value + "-01" : e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C0306] focus:border-transparent"
              />
            </div>
            <div>
              <button
                onClick={handleExportExcel}
                disabled={loading || reportData.length === 0}
                className="w-full bg-[#9C0306] hover:bg-red-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading report data...</div>
          ) : reportData.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No data available for the selected period.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#9C0306] text-white text-xs">
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Date / Period</th>
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Product Name</th>
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Status</th>
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Variant</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Unit Price</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Sold Qty</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Sold Value</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Stock Decrease</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Purchased Qty</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Purchased Value</th>
                      <th className="px-3 py-3 text-right font-bold whitespace-nowrap">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 hover:bg-red-50 transition-colors text-xs ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{row.date_range.display}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">{row.product_name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {row.status === 'active' ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 capitalize">{row.variant_type}</td>
                        <td className="px-3 py-2 text-right text-gray-700">₱{row.unit_price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{row.sold_qty}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[#9C0306]">₱{row.sold_value.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{row.stock_decrease}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{row.purchased_qty}</td>
                        <td className="px-3 py-2 text-right font-semibold text-green-700">₱{row.purchased_value.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#9C0306]">{row.current_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-[#9C0306] hover:text-[#9C0306] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${page === currentPage ? 'bg-[#9C0306] text-white border-[#9C0306]' : 'border-gray-300 text-gray-600 hover:border-[#9C0306] hover:text-[#9C0306]'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-[#9C0306] hover:text-[#9C0306] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </div>

        <AdminFooter />
      </div>
    </div>
  );
}
