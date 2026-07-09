import Swal from 'sweetalert2';

export async function confirmDelete(
  title = 'Delete Election?',
  text = 'This action cannot be undone.',
) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',

    showCancelButton: true,

    confirmButtonText: 'Delete',

    cancelButtonText: 'Cancel',

    confirmButtonColor: '#dc2626',

    cancelButtonColor: '#64748b',
  });

  return result.isConfirmed;
}