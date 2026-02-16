import { useEffect } from 'react';
import Alert from '@mui/material/Alert';

export type AppAlertProps = {
  message: string;
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
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
  <div className="absolute top-4 right-20 z-50">
  <Alert severity={severity} onClose={onClose}>{message}</Alert>
</div>

  );
};

export default AppAlert;
