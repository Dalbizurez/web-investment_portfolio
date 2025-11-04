import { useState, useCallback } from 'react';
import { useUser } from "../components/UserContext";
import axios from "axios";

const API_URL = "http://back.g4.atenea.lat/api/stocks/reports/request/";
interface StockReportRequest {
  date_from?: string | null;
  date_to?: string | null;
  include_current_valuation?: boolean;
  format?: "PDF" | "CSV";
}

interface StockReportResponse {
  message: string;
  report_id: string;
  status: string;
  file_url: string | null;
}

interface UseStockReportsReturn {
  report: StockReportResponse | null;
  requestReport: (requestData: StockReportRequest) => Promise<StockReportResponse | null>;
  isRequesting: boolean;
  error: string | null;
  successMessage: string | null;
}

// hooks/useStockReports.ts
export const useStockReports = (): UseStockReportsReturn => {
  const { token } = useUser();
  const [report, setReport] = useState<StockReportResponse | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requestReport = useCallback(async (requestData: StockReportRequest): Promise<StockReportResponse | null> => {
    setIsRequesting(true);
    setError(null);
    setSuccessMessage(null);
    setReport(null);

    try {
      if (requestData.format && !["PDF", "CSV"].includes(requestData.format)) {
        throw new Error("El formato debe ser 'PDF' o 'CSV'");
      }

      const response = await axios.post(API_URL, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const reportResponse: StockReportResponse = response.data;
      setReport(reportResponse);
      setSuccessMessage(reportResponse.message);
      
      alert(` ${reportResponse.message}`);
      
      return reportResponse;
    } catch (error: any) {
      let errorMessage = "Error al solicitar el reporte de stocks";
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('CORS') || error.message?.includes('blocked')) {
        errorMessage = "Error de CORS. Contacta al administrador.";
      } 
      else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      
      alert(`${errorMessage}`);
      
      console.error("Error requesting stock report:", error);
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [token]);

  return {
    report,
    requestReport,
    isRequesting,
    error,
    successMessage
  };
};