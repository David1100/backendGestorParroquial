'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAPI } from './api';

export interface Firmante {
  id: number;
  nombre: string;
}

export interface QuienFirma {
  id: number;
  nombre: string;
  firmantes: Firmante[];
}

interface FirmanteSelectionOverrides {
  quienFirma?: string;
  firmante?: string;
}

export type FirmanteOverrides = FirmanteSelectionOverrides;

export function useFirmantes(parroquiaId?: number | null) {
  const [quienesFirma, setQuienesFirma] = useState<QuienFirma[]>([]);
  const [loadingQuienesFirma, setLoadingQuienesFirma] = useState(false);
  const [selectedQuienFirmaId, setSelectedQuienFirmaId] = useState<number | null>(null);
  const [selectedFirmanteId, setSelectedFirmanteId] = useState<number | null>(null);

  const loadQuienesFirma = useCallback(async () => {
    if (!parroquiaId) {
      setQuienesFirma([]);
      setSelectedQuienFirmaId(null);
      setSelectedFirmanteId(null);
      return;
    }

    setLoadingQuienesFirma(true);
    try {
      const result = await fetchAPI(`/parroquias/${parroquiaId}/quienfirma`);
      setQuienesFirma(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error cargando quienes firma:', err);
      setQuienesFirma([]);
    } finally {
      setLoadingQuienesFirma(false);
    }
  }, [parroquiaId]);

  useEffect(() => {
    loadQuienesFirma();
  }, [loadQuienesFirma]);

  useEffect(() => {
    if (quienesFirma.length === 0) {
      setSelectedQuienFirmaId(null);
      setSelectedFirmanteId(null);
      return;
    }

    setSelectedQuienFirmaId((prev) => {
      if (prev && quienesFirma.some((item) => item.id === prev)) {
        return prev;
      }
      return quienesFirma[0].id;
    });
  }, [quienesFirma]);

  useEffect(() => {
    const current = quienesFirma.find((item) => item.id === selectedQuienFirmaId);
    if (!current || current.firmantes.length === 0) {
      setSelectedFirmanteId(null);
      return;
    }

    setSelectedFirmanteId((prev) => {
      if (prev && current.firmantes.some((firmante) => firmante.id === prev)) {
        return prev;
      }
      return current.firmantes[0]?.id ?? null;
    });
  }, [selectedQuienFirmaId, quienesFirma]);

  const selectedQuienFirma = useMemo(() => {
    return quienesFirma.find((item) => item.id === selectedQuienFirmaId) ?? null;
  }, [quienesFirma, selectedQuienFirmaId]);

  const selectedFirmante = useMemo(() => {
    if (!selectedQuienFirma) return null;
    return selectedQuienFirma.firmantes.find((firmante) => firmante.id === selectedFirmanteId) ?? null;
  }, [selectedFirmanteId, selectedQuienFirma]);

  return {
    quienesFirma,
    firmantes: selectedQuienFirma?.firmantes ?? [],
    loadingQuienesFirma,
    reloadQuienesFirma: loadQuienesFirma,
    selectedQuienFirmaId,
    setSelectedQuienFirmaId,
    selectedFirmanteId,
    setSelectedFirmanteId,
    selectedQuienFirma,
    selectedFirmante,
  };
}
