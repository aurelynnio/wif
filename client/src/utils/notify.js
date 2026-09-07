import { toast } from 'sonner';

const getAxiosMessage = error => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    (typeof error === 'string' ? error : null)
  );
};

// `notify` keeps the old `toast`-style API: callable + notify.success/error/...
const baseNotify = (...args) => toast(...args);

export const notify = Object.assign(baseNotify, toast, {
  errorFrom: (error, fallback = 'Something went wrong') => {
    const msg = getAxiosMessage(error) || fallback;
    return toast.error(msg);
  },
});