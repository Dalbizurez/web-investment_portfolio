import { useState, useEffect } from "react";

export interface SearchResult {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface UseSearchActionsProps {
  fetchData: (query: string, category: string, extraFilter: string) => Promise<SearchResult[]>;
}

export const useSearchActions = ({ fetchData }: UseSearchActionsProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [extraFilter, setExtraFilter] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetchData(query, category, extraFilter);
      setResults(data);
    } catch (err) {
      console.error("Error al obtener resultados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query || category || extraFilter) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [query, category, extraFilter]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    extraFilter,
    setExtraFilter,
    results,
    loading,
    handleSearch,
  };
};
