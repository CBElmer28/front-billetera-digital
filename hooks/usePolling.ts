import { useEffect, useRef } from 'react';

/**
 * Hook para ejecutar una función de carga de datos periódicamente.
 * @param callback Función asíncrona que carga los datos.
 * @param intervalMs Intervalo en milisegundos (default 5000ms).
 * @param stopCondition (Opcional) Si es true, detiene el polling.
 */
export function usePolling(
  callback: (isAutoRefresh?: boolean) => Promise<void>, 
  intervalMs: number = 5000,
  stopCondition: boolean = false
) {
  const savedCallback = useRef(callback);

  // Recordar el último callback si cambia
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // 1. Carga inicial inmediata
    savedCallback.current(false); // false = muestra spinner si la función lo soporta

    if (stopCondition) return;

    // 2. Configurar intervalo
    const id = setInterval(() => {
      savedCallback.current(true); // true = modo silencioso (sin spinner)
    }, intervalMs);

    // 3. Limpiar al desmontar
    return () => clearInterval(id);
  }, [intervalMs, stopCondition]);
}