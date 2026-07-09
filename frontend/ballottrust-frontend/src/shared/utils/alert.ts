import Swal from 'sweetalert2';

export function success(
  title: string,
) {
  return Swal.fire({
    icon: 'success',
    title,
    timer: 1500,
    showConfirmButton: false,
  });
}

export function error(
  title: string,
) {
  return Swal.fire({
    icon: 'error',
    title,
  });
}