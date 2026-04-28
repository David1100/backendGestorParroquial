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

  if (!result.isConfirmed) {
    return false;
  }

  Swal.fire({
    title: 'Eliminando...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  return true;
}

export function closeAlert() {
  Swal.close();
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

interface CitaProxima {
  id: number;
  sacerdote: string;
  feligres: string;
  fechaHora: string;
  motivo: string;
}

export function alertCitasProximas(citas: CitaProxima[]) {
  if (!citas || citas.length === 0) return;

  const now = new Date();
  const formatted = citas
    .map((cita) => {
      const fecha = new Date(cita.fechaHora);
      const diffMs = fecha.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHrs = Math.round(diffMins / 60);

      const timeStr = fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      const timeLabel = diffMins <= 60 ? `en ${diffMins} min` : `en ${diffHrs} hrs`;

      return `<b>${timeLabel}</b>: ${cita.feligres} con ${cita.sacerdote} - ${cita.motivo} (${timeStr})`;
    })
    .join('<br>');

  return Swal.fire({
    title: 'Citas proximas',
    html: formatted,
    icon: 'info',
    confirmButtonText: 'Aceptar',
  });
}
