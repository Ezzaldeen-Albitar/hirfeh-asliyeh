import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
  timerProgressBar: true,
  customClass: { popup: 'ha-toast' },
});

export const toast = {
  success: (msg) => Toast.fire({ icon: 'success', title: msg }),
  error:   (msg) => Toast.fire({ icon: 'error',   title: msg }),
  info:    (msg) => Toast.fire({ icon: 'info',     title: msg }),
  warning: (msg) => Toast.fire({ icon: 'warning',  title: msg }),
};

export const confirm = (opts = {}) =>
  Swal.fire({
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#7A1C2E',
    cancelButtonColor: '#C4B89A',
    confirmButtonText: opts.confirmText || 'نعم، تأكيد',
    cancelButtonText:  opts.cancelText  || 'إلغاء',
    title:   opts.title   || 'هل أنت متأكد؟',
    text:    opts.text    || '',
    ...opts,
  });
