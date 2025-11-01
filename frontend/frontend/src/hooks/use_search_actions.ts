import { useState, useEffect } from "react";

export interface SearchResult {
  id: string;        // symbol
  name: string;      // description
  category: string;  // type
  price: number;     // current_price
}

export const useSearchActions = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [extraFilter, setExtraFilter] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch integrado
  const fetchStocks = async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];

    const response = await fetch(`http://localhost:8000/api/stocks/search/?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Error al obtener datos:", response.status);
      throw new Error(`Error en la búsqueda (${response.status})`);
    }

    const data = await response.json();
    return data.results || [];
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Traemos resultados solo por query
      let data = await fetchStocks(query);

      // Filtrado manual
      if (category) {
        data = data.filter((item) =>
          item.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      if (extraFilter) {
        data = data.filter((item) =>
          item.name.toLowerCase().includes(extraFilter.toLowerCase())
        );
      }

      setResults(data);
    } catch (err) {
      console.error("Error al obtener resultados:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query || category || extraFilter) {
        handleSearch();
      } else {
        setResults([]);
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
