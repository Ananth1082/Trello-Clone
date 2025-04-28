export const Dialog = ({ title, children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-md min-w-[20rem]">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-4 p-2 bg-red-400 rounded w-full">
        Close
      </button>
    </div>
  </div>
);
