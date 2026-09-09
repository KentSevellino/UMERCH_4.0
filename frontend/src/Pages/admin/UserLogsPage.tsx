import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import AddUsersModal from '../../components/modals/AddUsersModals';
import EditUsersModals from '../../components/modals/EditUsersModals';
import DeleteUsersModals from '../../components/modals/DeleteUsersModals';
import UserLogsActionModal from '../../components/modals/UserLogsActionModal';
import { useUserLogs } from '../../hooks/useUserLogs';

import TotalLoginUsers from '../../assets/images/TotalLoginUsers.svg';
import DeactivatedAccount from '../../assets/images/DeactivatedAccount.svg';
import VerticalEllipsis from '../../assets/images/VerticalEllipsis.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, className = "bg-green-700", icon }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${className}`}>
    <div>
      <div className="text-lg opacity-90">{title}</div>
      <div className="text-4xl font-bold mt-1">{value}</div>
    </div>
    <div className="w-12 h-12 rounded-lg flex items-center justify-center">{icon}</div>
  </div>
);

function UserLogsPage() {
  const {
    query, setQuery, isAddUsersOpen, users, toast, toastType, showingToast, isEditOpen, selectedUser,
    isDeleteOpen, userToDelete, currentPage, setCurrentPage, actionModalOpen, setActionModalOpen, itemsPerPage,
    openAddUsersModal, closeAddUsersModal, handleUserAdded, openUpdateModal, closeEditModal,
    handleUpdateSuccess, openDeleteModal, closeDeleteModal, handleDeleteSuccess, handleDeleteError,
    handleReactivate, handleDeactivate, filterUsers, getPaginatedUsers, getTotalPages, goToPage, mapUser,
  } = useUserLogs();

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>
      <main className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em]">RECORD LOGS</h1>
        <p className="text-gray-500 mt-2">Welcome back Admin, everything looks great.</p>

        <div className="mt-7 flex gap-6">
          <StatCard
            title="Total Users"
            value={users.filter((u) => u.role !== 'Admin' && u.um_id !== 1 && u.email !== 'admin@umerch.com' && (u.status === 'active' || u.status === 'Active')).length}
            className="bg-green-700"
            icon={<img src={TotalLoginUsers} alt="Total Login Users" className="w-20 h-20" />}
          />
          <StatCard
            title="Deactivated Account"
            value={users.filter((u) => u.role !== 'Admin' && u.um_id !== 1 && u.email !== 'admin@umerch.com' && (u.status === 'inactive' || u.status === 'Inactive')).length}
            className="bg-red-600"
            icon={<img src={DeactivatedAccount} alt="Deactivated Account" className="w-20 h-20" />}
          />
        </div>

        <h2 className="text-2xl font-bold mt-10">Users Logs</h2>

        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-1 max-w-130 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <img src={SearchIcon} alt="Search" className="w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Email or UserId"
              className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            className="bg-red-800 hover:bg-red-900 text-white px-10 py-3 rounded-full text-sm font-semibold hover:cursor-pointer"
            onClick={openAddUsersModal}
          >
            Add User
          </button>
        </div>

        <div className="bg-white rounded-xl mt-6 shadow-sm border border-gray-200 overflow-visible">
          <div className="px-8 py-6">
            <div className="grid grid-cols-12 text-sm font-bold text-red-700 text-center">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">Name</div>
              <div className="col-span-2">UserId</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-center">Action</div>
            </div>
          </div>
          <div className="border-t border-gray-200" />
          {(() => {
            const filteredUsers = filterUsers(users, query);
            const idOf = (u: any) => Number(u.id ?? u.um_id ?? u.userId ?? u.user_id ?? u.ID ?? 0);
            const sortedUsers = [...filteredUsers].sort((a, b) => {
              if (idOf(a) === 1) return -1;
              if (idOf(b) === 1) return 1;
              return idOf(a) - idOf(b);
            });
            const totalPages = getTotalPages(sortedUsers, itemsPerPage);
            const paginatedUsers = getPaginatedUsers(sortedUsers, currentPage, itemsPerPage).slice(0, itemsPerPage);

            if (paginatedUsers.length > 0) {
              return paginatedUsers.map((userRaw: any) => {
                const user = mapUser(userRaw);
                return (
                  <div key={user.id} className="grid grid-cols-12 items-center text-sm text-gray-900 px-8 py-2 border-b border-gray-200 hover:bg-gray-50 text-center">
                    <div className="col-span-1">{user.id}</div>
                    <div className="col-span-2">{user.user_fullname}</div>
                    <div className="col-span-2">{user.um_id}</div>
                    <div className="col-span-3">{user.email}</div>
                    <div className="col-span-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' || user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' || user.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="relative">
                        <button
                          onClick={() => setActionModalOpen(actionModalOpen === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <img src={VerticalEllipsis} alt="Actions" className="w-4 h-4" />
                        </button>
                        <UserLogsActionModal
                          isOpen={actionModalOpen === user.id}
                          onClose={() => setActionModalOpen(null)}
                          user={userRaw}
                          onEdit={openUpdateModal}
                          onReactivate={handleReactivate}
                          onDeactivate={handleDeactivate}
                          onDelete={openDeleteModal}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            } else {
              return <div className="px-8 py-6 text-center text-gray-500">No User Available</div>;
            }
          })()}
          {(() => {
            const filteredUsers = filterUsers(users, query);
            const idOf = (u: any) => Number(u.id ?? u.um_id ?? u.userId ?? u.user_id ?? u.ID ?? 0);
            const sortedUsers = [...filteredUsers].sort((a, b) => {
              if (idOf(a) === 1) return -1;
              if (idOf(b) === 1) return 1;
              return idOf(a) - idOf(b);
            });
            const totalPages = getTotalPages(sortedUsers, itemsPerPage);

            if (sortedUsers.length > 0) {
              return (
                <>
                  <div className="border-t border-gray-200" />
                  <div className="py-4 flex items-center justify-center gap-7 text-sm font-semibold">
                    <button
                      onClick={() => goToPage(currentPage - 1, totalPages)}
                      disabled={currentPage === 1}
                      className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page, totalPages)}
                        className={`${page === currentPage ? 'text-[#9C0306]' : 'text-gray-900 hover:text-[#9C0306]'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1, totalPages)}
                      disabled={currentPage === totalPages}
                      className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              );
            }
            return null;
          })()}
        </div>

        <AddUsersModal isOpen={isAddUsersOpen} onClose={closeAddUsersModal} onUserAdded={handleUserAdded} />
        <EditUsersModals isOpen={isEditOpen} onClose={closeEditModal} user={selectedUser} onSuccess={handleUpdateSuccess} />
        <DeleteUsersModals isOpen={isDeleteOpen} onClose={closeDeleteModal} user={userToDelete} onDeleted={handleDeleteSuccess} onError={handleDeleteError} />
        <AdminFooter />
        {showingToast && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white z-[70] transition-all ${toastType === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserLogsPage;
