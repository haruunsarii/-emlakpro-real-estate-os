import { useToastContext } from '../context/ToastContextCore';

export { useToastContext };

/**
 * useToast Hook
 * Provides access to the centralized Toast notification system.
 *
 * Usage:
 * const { showToast, toast } = useToast();
 * toast.success('İşlem başarılı');
 * toast.error('Bir hata oluştu');
 * toast.warning('Dikkat: Kontrol edin');
 * toast.info('Bilgilendirme');
 *
 * Or legacy signature:
 * showToast('Mesaj metni', 'success' | 'error' | 'warning' | 'info');
 */
export function useToast() {
  return useToastContext();
}

export default useToast;

