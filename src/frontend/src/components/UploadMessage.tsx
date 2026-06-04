interface UploadMessageProps {
  message: { type: 'success' | 'error'; text: string };
  onDismiss: () => void;
}

export function UploadMessage({ message, onDismiss }: UploadMessageProps) {
  const isSuccess = message.type === 'success';
  return (
    <div className="uploadMess">
      <div className="w-full flex justify-center my-8">
        <div
          className={`shadow-md rounded-lg p-6 max-w-sm w-full flex flex-col items-center border ${
            isSuccess ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'
          }`}
        >
          <div className="font-semibold mb-4 text-center text-white">{message.text}</div>
          <button className="btn btn-outline w-32" onClick={onDismiss}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
