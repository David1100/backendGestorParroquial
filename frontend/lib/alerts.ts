import Swal from 'sweetalert2';

export async function confirmDelete(text = 'Esta accion no se puede deshacer') {
  const result = await Swal.fire({
    title: 'Confirmar eliminacion',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
  });

  return result.isConfirmed;
}

export function successAlert(title: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 1800,
    showConfirmButton: false,
  });
}

export function loadingAlert(title = 'Cargando', text = 'Por favor espera...') {
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeLoadingAlert() {
  Swal.close();
}

export function errorAlert(error: unknown, fallback = 'Ocurrio un error') {
  const text = error instanceof Error ? error.message : fallback;
  return Swal.fire({
    title: 'Error',
    text,
    icon: 'error',
  });
}
