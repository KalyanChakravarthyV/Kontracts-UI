import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearAlertMessages } from '@/store/slices/alertMessageSlice';
import { X, CheckCircle, XCircle } from 'lucide-react';

export function AlertMessage() {
  const dispatch = useAppDispatch();
  const { successMessage, errorMessage } = useAppSelector(
    (state) => state.alertMessage
  );

  const handleClose = () => {
    dispatch(clearAlertMessages());
  };

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAlertMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage, dispatch]);

  if (!successMessage && !errorMessage) {
    return null;
  }

  const isSuccess = !!successMessage;
  const message = successMessage || errorMessage;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div
        className={`rounded-lg shadow-lg p-6 ${
          isSuccess
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isSuccess ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-medium ${
                isSuccess ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {isSuccess ? 'Success' : 'Error'}
            </h3>
            <p
              className={`mt-1 text-base ${
                isSuccess ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 rounded-md p-1 inline-flex ${
              isSuccess
                ? 'text-green-500 hover:bg-green-100'
                : 'text-red-500 hover:bg-red-100'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSuccess ? 'focus:ring-green-500' : 'focus:ring-red-500'
            }`}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
