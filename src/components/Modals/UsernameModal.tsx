export const UsernameModal = () => {
  return (
    <div className="absolute z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold">
          [X]
        </button>
        
        {/* Modal Heading */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Username</h2>
        
        {/* Input Field */}
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400">Cancel</button>
          <button className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600">Save</button>
        </div>
      </div>
    </div>
  );
};
