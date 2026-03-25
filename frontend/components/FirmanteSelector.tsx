'use client';

import { QuienFirma, Firmante } from '@/lib/useFirmantes';

interface FirmanteSelectorProps {
  quienesFirma: QuienFirma[];
  firmantes: Firmante[];
  selectedQuienFirmaId: number | null;
  onSelectQuienFirma: (id: number | null) => void;
  selectedFirmanteId: number | null;
  onSelectFirmante: (id: number | null) => void;
  loading?: boolean;
}

export default function FirmanteSelector({
  quienesFirma,
  firmantes,
  selectedQuienFirmaId,
  onSelectQuienFirma,
  selectedFirmanteId,
  onSelectFirmante,
  loading = false,
}: FirmanteSelectorProps) {
  const handleRolChange = (value: string) => {
    const parsed = value ? Number(value) : null;
    if (parsed === null || Number.isNaN(parsed)) {
      onSelectQuienFirma(null);
      return;
    }
    onSelectQuienFirma(parsed);
  };

  const handleFirmanteChange = (value: string) => {
    const parsed = value ? Number(value) : null;
    if (parsed === null || Number.isNaN(parsed)) {
      onSelectFirmante(null);
      return;
    }
    onSelectFirmante(parsed);
  };

  const disableRolSelect = loading || quienesFirma.length === 0;
  const disableFirmanteSelect = loading || firmantes.length === 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Quién firma</label>
        <select
          value={selectedQuienFirmaId ?? ''}
          onChange={(event) => handleRolChange(event.target.value)}
          disabled={disableRolSelect}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">{loading ? 'Cargando roles...' : 'Seleccione un rol'}</option>
          {quienesFirma.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>
        {quienesFirma.length === 0 && !loading && (
          <p className="mt-1 text-xs text-slate-400">Crea roles en el módulo "Quién firma".</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Firmante</label>
        <select
          value={selectedFirmanteId ?? ''}
          onChange={(event) => handleFirmanteChange(event.target.value)}
          disabled={disableFirmanteSelect}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">{loading ? 'Cargando firmantes...' : 'Seleccione un firmante'}</option>
          {firmantes.map((firmante) => (
            <option key={firmante.id} value={firmante.id}>
              {firmante.nombre}
            </option>
          ))}
        </select>
        {firmantes.length === 0 && !loading && quienesFirma.length > 0 && (
          <p className="mt-1 text-xs text-slate-400">No hay firmantes para este rol.</p>
        )}
      </div>
    </div>
  );
}
