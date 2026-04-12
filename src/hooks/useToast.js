import { useState } from 'react';

export default function useToast(timeout = 8000) {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), timeout);
  };
  return { toast, showToast, setToast };
}
