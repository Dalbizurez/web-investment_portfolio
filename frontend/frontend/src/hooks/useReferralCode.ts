import { useState, useCallback } from 'react';
import { useUser } from "../components/UserContext";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

interface UseReferralCodeReturn {
  referralCode: string | null;
  fetchReferralCode: () => Promise<string | null>;
  shareReferralCode: () => Promise<void>;
  isSharing: boolean;
  error: string | null;
}

export const useReferralCode = (): UseReferralCodeReturn => {
  const { token } = useUser();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralCode = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/user_try/profile/`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const code = response.data.referral_code;
      setReferralCode(code);
      return code;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error fetching referral code";
      setError(errorMessage);
      console.log("Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return null;
    }
  }, [token]);

  const shareReferralCode = useCallback(async (): Promise<void> => {
    setIsSharing(true);
    setError(null);
    
    try {
      let code = referralCode;
      if (!code) {
        code = await fetchReferralCode();
      }

      if (!code) {
        throw new Error("No se pudo obtener el código de referido");
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Invite to Hapi",
            text: "Join Hapi and earn free cryptocurrency.",
            url: code,
          });
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        await navigator.clipboard.writeText(code);
        alert("Código copiado al portapapeles: " + code);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error sharing referral code";
      setError(errorMessage);
      console.error("Error sharing code:", err);
    } finally {
      setIsSharing(false);
    }
  }, [referralCode, fetchReferralCode]);

  return {
    referralCode,
    fetchReferralCode,
    shareReferralCode,
    isSharing,
    error
  };
};