interface User {
  status?: string;
  user_status?: string;
}

interface UserLogsActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
  onReactivate: (user: User) => void;
  onDeactivate: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserLogsActionModal({ isOpen, onClose, user, onEdit, onReactivate, onDeactivate, onDelete }: UserLogsActionModalProps) {
  if (!isOpen) return null;

  const userStatus = user?.status || user?.user_status || 'active';
  const isActive = userStatus === 'active' || userStatus === 'Active';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-8 z-[101] bg-white rounded-lg shadow-xl border border-gray-200 py-3 px-2 w-32 flex flex-col gap-2">
        {/* Edit */}
        <button
          onClick={() => {
            onEdit(user!);
            onClose();
          }}
          className="w-full px-4 py-2 text-center text-sm font-semibold text-white bg-[#9C0306] rounded-full hover:bg-[#7d0205] transition-colors"
        >
          Edit
        </button>

        {/* Deactivate or Reactivate based on status */}
        {isActive ? (
          <button
            onClick={() => {
              onDeactivate(user!);
              onClose();
            }}
            className="w-full px-4 py-2 text-center text-sm font-semibold text-white bg-gray-500 rounded-full hover:bg-gray-600 transition-colors"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => {
              onReactivate(user!);
              onClose();
            }}
            className="w-full px-4 py-2 text-center text-sm font-semibold text-white bg-gray-500 rounded-full hover:bg-gray-600 transition-colors"
          >
            Reactivate
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => {
            onDelete(user!);
            onClose();
          }}
          className="w-full px-4 py-2 text-center text-sm font-semibold text-[#9C0306] bg-white border-2 border-[#9C0306] rounded-full hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </>
  );
}
