import Swal from 'sweetalert2';

const base = {
  customClass: {
    popup:            'ha-toast',
    confirmButton:    'btn btn-primary px-4',
    cancelButton:     'btn btn-outline-secondary px-4 ms-2',
  },
  buttonsStyling: false,
  fontFamily:     'Tajawal, sans-serif',
};

export const toast = {
  success: (msg) => Swal.fire({ ...base, icon:'success', title:msg, toast:true, position:'top-end', showConfirmButton:false, timer:3000, timerProgressBar:true }),
  error:   (msg) => Swal.fire({ ...base, icon:'error',   title:msg, toast:true, position:'top-end', showConfirmButton:false, timer:4000, timerProgressBar:true }),
  info:    (msg) => Swal.fire({ ...base, icon:'info',    title:msg, toast:true, position:'top-end', showConfirmButton:false, timer:3000, timerProgressBar:true }),
  warning: (msg) => Swal.fire({ ...base, icon:'warning', title:msg, toast:true, position:'top-end', showConfirmButton:false, timer:3500, timerProgressBar:true }),
};

export const confirm = ({ title, text, confirmButtonText='تأكيد', confirmButtonColor='var(--burgundy)', cancelButtonText='إلغاء' } = {}) =>
  Swal.fire({
    ...base,
    title, text,
    icon:               'warning',
    showCancelButton:   true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    reverseButtons:     true,
  });

export default Swal;
