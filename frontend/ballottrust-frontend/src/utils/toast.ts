import { toast } from 'react-hot-toast';

class ToastService {
  success(message: string) {
    toast.success(message, {
      duration: 3000,
    });
  }

  error(message: string) {
    toast.error(message, {
      duration: 4000,
    });
  }

  loading(message: string) {
    return toast.loading(message);
  }

  dismiss(id?: string) {
    toast.dismiss(id);
  }

  promise<T>(
    promise: Promise<T>,
    loading: string,
    success: string,
    error: string,
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  }
}

export default new ToastService();