import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import EditProductModal from '../../components/modals/EditProductModal';
import DeleteProductModal from '../../components/modals/DeleteProductModal';
import AddProductModal from '../../components/modals/AddProductModal';
import ProductActionModal from '../../components/modals/ProductActionModal';
import { useAddProducts } from '../../hooks/useAddProducts';
import placeholderImg from '../../assets/images/product-placeholder.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, className, icon }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${className}`}>
    <div>
      <div className="text-lg opacity-90">{title}</div>
      <div className="text-4xl font-bold leading-tight mt-1">{value}</div>
    </div>
    {icon && (
      <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
        {icon}
      </div>
    )}
  </div>
);

export default function AddProductsPage() {
  const {
    products, openAdd, setOpenAdd, openEdit, setOpenEdit, selectedProduct, setSelectedProduct,
    openDelete, setOpenDelete, toast, showingToast, searchQuery, setSearchQuery,
    currentPage, setCurrentPage, totalPages, normalizeImageUrl, groupProductsByName,
    fetchProducts, showToast, getPaginatedProducts,
  } = useAddProducts();

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <div className="h-screen sticky top-0">
          <Sidebar />
        </div>

        <div className="flex-1 px-10 py-10 flex flex-col">
          <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
            <h1 className="text-4xl font-extrabold tracking-[0.25em]">INVENTORY</h1>
          </div>

          <p className="text-gray-500 mb-6">Welcome back Admin, everything looks great.</p>

          <div className="flex flex-wrap gap-6 mb-6">
            <StatCard
              title="Total Products"
              value={Object.keys(groupProductsByName(products)).length}
              className="bg-[#5C975A]"
            />
            <StatCard
              title="Total Variants"
              value={products.length}
              className="bg-blue-700"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mt-10">Products</h2>

            <div className="mt-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 flex-1 max-w-[520px] h-12 bg-white rounded-lg px-4 py-3 border border-gray-200">
                <img src={SearchIcon} alt="Search" className="w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              <button
                onClick={() => setOpenAdd(true)}
                className="bg-red-800 hover:bg-red-900 text-white px-10 py-3 rounded-full text-sm font-semibold hover:cursor-pointer"
              >
                Add Product
              </button>
            </div>

            <div className="bg-white rounded-xl mt-6 shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6">
                <div className="grid grid-cols-12 text-sm font-bold text-red-700 gap-4">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Cost</div>
                  <div className="col-span-2">Variants</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              <div className="min-h-[520px]">
                {(() => {
                  if (products.length === 0) {
                    return (
                      <div className="text-center py-20 text-gray-400">No products added yet</div>
                    );
                  }

                  const paginatedProducts = getPaginatedProducts();

                  if (paginatedProducts.length === 0) {
                    return (
                      <div className="text-center py-20 text-gray-400">No products found</div>
                    );
                  }

                  return paginatedProducts.map(([productName, variants]) => (
                    <div key={productName}>
                      <div className="grid grid-cols-12 py-4 px-8 border-b border-gray-200 hover:bg-gray-50 bg-gray-50 font-semibold gap-4">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden flex items-center justify-center bg-gray-200 flex-shrink-0">
                            <img
                              src={normalizeImageUrl(variants[0].product_image)}
                              alt={productName}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = placeholderImg;
                              }}
                            />
                          </div>
                          <span className="truncate">{productName}</span>
                        </div>

                        <div className="col-span-2 flex items-center">₱{variants[0].product_price}</div>

                        <div className="col-span-2 flex items-center text-gray-600 capitalize">
                          {variants[0].variant_type || "-"}
                        </div>

                        <div className="col-span-2 flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[0].status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                            {variants[0].status === 'active' ? 'Active' : 'Archived'}
                          </span>
                        </div>

                        <div className="col-span-2 flex justify-end items-center">
                          <ProductActionModal
                            product={variants[0]}
                            onEdit={() => {
                              setSelectedProduct(variants[0]);
                              setOpenEdit(true);
                            }}
                            onArchive={() => handleArchive(variants[0].product_id)}
                            onRestore={() => handleRestore(variants[0].product_id)}
                            onDelete={() => {
                              setSelectedProduct(variants[0]);
                              setOpenDelete(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {totalPages > 1 && (
                <>
                  <div className="border-t border-gray-200" />
                  <div className="py-4 flex items-center justify-center gap-7 text-sm font-semibold">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`${page === currentPage ? 'text-[#9C0306]' : 'text-gray-900 hover:text-[#9C0306]'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>

          <AdminFooter />
        </div>

        <AddProductModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={() => {
            fetchProducts();
            showToast("Product added successfully!");
          }}
        />

        <EditProductModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          product={selectedProduct}
          onSuccess={() => {
            fetchProducts();
            showToast("Product updated successfully!");
          }}
        />

        <DeleteProductModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          product={selectedProduct}
          onDeleted={() => { fetchProducts(); showToast("Product deleted successfully!"); }}
          onShowToast={showToast}
        />
      </div>
      {showingToast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-slide-in-right z-[9999] flex items-center gap-3 min-w-[320px]">
          <div className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-base">{toast}</span>
        </div>
      )}
    </>
  );
}
