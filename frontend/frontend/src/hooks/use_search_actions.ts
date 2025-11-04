import { useState, useEffect } from "react";
import { STOCK_THEMATIC_FILTERS } from "../hooks/fil.ts";

export interface SearchResult {
  id: string;        // symbol
  name: string;      // description
  category: string;  // type
  price: number;     // current_price
}

export const useSearchActions = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");      // Código oficial (EQS, ETF, etc.)
  const [extraFilter, setExtraFilter] = useState(""); // Categoría personalizada (temática)
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 API local
  const fetchStocks = async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];

    const response = await fetch(
      `http://back.g4.atenea.lat/api/stocks/search/?q=${encodeURIComponent(query)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

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
      // Paso 1: búsqueda base
      let data = await fetchStocks(query);

      // Paso 2: filtro por categoría oficial (type)
      if (category) {
        data = data.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Paso 3: filtro por categoría personalizada (temática)
      if (extraFilter) {
        const thematic = STOCK_THEMATIC_FILTERS.find(
          (f) => f.category === extraFilter
        );

        if (thematic) {
          // Generamos una lista de símbolos relevantes (ejemplo: ["AAPL", "MSFT"])
          const symbols = thematic.examples.map((ex) => ex.split(" - ")[0].toUpperCase());

          data = data.filter((item) =>
            symbols.includes(item.id.toUpperCase())
          );
        } else {
          // Si no hay coincidencia exacta, aplicamos filtro textual
          data = data.filter((item) =>
            item.name.toLowerCase().includes(extraFilter.toLowerCase())
          );
        }
      }

      setResults(data);
    } catch (err) {
      console.error("Error al obtener resultados:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Efecto de búsqueda automática
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
