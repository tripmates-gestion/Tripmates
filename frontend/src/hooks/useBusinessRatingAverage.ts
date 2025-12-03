import { useEffect, useState } from "react";
import { getBusinessRatingAverage } from "../services/metricsService";
import { useAuth } from "./useAuth";

export function useBusinessRatingAverage(businessId?: string | null) {
  const { accessToken } = useAuth();
  const [ratingAverage, setRatingAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    let canceled = false;
    setLoading(true);


    console.log('Obteniendo promedio de calificaciones para el negocio ID:', businessId);

    getBusinessRatingAverage(businessId, accessToken)
      .then((avg) => {
        if (canceled) return;
        setRatingAverage(typeof avg === "number" ? avg : null);
      })
      .catch((err) => {
        if (canceled) return;
        console.error("No se pudo obtener el promedio de calificaciones", err);
        setRatingAverage(null);
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [accessToken, businessId]);

  return { ratingAverage, loading };
}
