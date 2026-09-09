import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';

export default function TransactionPage() {
  return (
    <div className="flex min-h-screen bg-[#F6F6F6]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-[#9C0306] mb-6">Transactions</h1>
          <p className="text-[#727272]">Transaction management content will be loaded here</p>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
}
