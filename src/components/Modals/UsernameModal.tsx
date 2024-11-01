interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsernameModal = ({ isOpen, onClose }: ModalProps) => {

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Username</h2>

        <input id="username" type="text" placeholder="Enter new username" className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400">Cancel</button>
          <button className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600">Save</button>
        </div>
      </div>
    </div>
  );
};
