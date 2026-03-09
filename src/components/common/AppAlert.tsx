import { useEffect } from 'react';
import Alert from '@mui/material/Alert';

export type AppAlertProps = {
  message: string | React.ReactNode;
  severity?: 'error' | 'success' | 'warning' | 'info';
  onClose?: () => void;
};

const AppAlert = ({
  message,
  severity = 'info',
  onClose,
}: AppAlertProps) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <Alert severity={severity} onClose={onClose} sx={{ width: '100%' }}>{message}</Alert>
    </div>
  );
};

export default AppAlert;
