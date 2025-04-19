import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface FetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  dependencies?: any[];
  initialFetch?: boolean;
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: FetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState<number>(0);

  const {
    onSuccess,
    onError,
    dependencies = [],
    initialFetch = true,
  } = options;

  const refetch = () => {
    setRefetchIndex(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    if (!initialFetch && refetchIndex === 0) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFunction();

        if (isMounted) {
          setData(result);
          if (onSuccess) {
            onSuccess(result);
          }
        }
      } catch (err) {
        if (isMounted) {
          const error =
            err instanceof Error ? err : new Error("Une erreur est survenue");
          setError(error);

          if (onError) {
            onError(error);
          } else {
            toast.error(
              error.message || "Erreur lors du chargement des données"
            );
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refetchIndex, ...dependencies]);

  return { data, loading, error, refetch };
}
