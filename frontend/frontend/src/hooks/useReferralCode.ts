import { useEffect, useMemo, useState } from "react";
import { useUser } from "../components/UserContext";
import axios from "axios";

const BASE = "http://back.g4.atenea.lat/api/user_try";

type Stats = {
  referral_code: string;
  successful_referrals: number;
  total_earnings: number;
  has_used_referral: boolean;
  referred_by: string | null;
  referred_users: Array<{
    id: number | string;
    username: string;
    email: string;
    created_at: string;
    status: string;
  }>;
};

export const useReferralCode = () => {
  const { token } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralCode = stats?.referral_code ?? "";
  const referralUrl = useMemo(() => {
    return referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : "";
  }, [referralCode]);

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    // Probamos 2 rutas posibles del backend
    const candidates = [`${BASE}/referral/stats/`, `${BASE}/referral-stats/`];
    for (const url of candidates) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
        setLoading(false);
        return;
      } catch (e) {
        // seguimos intentando
      }
    }
    setLoading(false);
    setError("No se pudo cargar la información de referidos.");
  };

  useEffect(() => { fetchStats(); /* eslint-disable-next-line */ }, [token]);

  const copyReferralUrl = async () => {
    if (!referralUrl) return;
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(referralUrl);
      alert("✅ Enlace de invitación copiado al portapapeles");
    } catch {
      setError("No se pudo copiar el enlace.");
    } finally {
      setIsSharing(false);
    }
  };

  const applyReferralCode = async (code: string) => {
    if (!token) return;
    setError(null);
    const payload = { referral_code: code.toUpperCase().trim() };
    const candidates = [
      `${BASE}/referral/use-code/`,
      `${BASE}/use-referral-code/`,
    ];
    for (const url of candidates) {
      try {
        const res = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(`🎉 ${res.data.message}. Bonus: $${res.data.bonus_received}. Balance: $${res.data.your_new_balance}`);
        await fetchStats();
        return true;
      } catch {
        // intentamos siguiente variante
      }
    }
    setError("No se pudo aplicar el código de referido.");
    return false;
  };

  return {
    loading,
    error,
    stats,
    referralCode,
    referralUrl,
    successfulReferrals: stats?.successful_referrals ?? 0,
    totalEarnings: stats?.total_earnings ?? 0,
    hasUsedReferral: stats?.has_used_referral ?? false,
    referredBy: stats?.referred_by ?? null,
    referredUsers: stats?.referred_users ?? [],
    copyReferralUrl,
    applyReferralCode,
    isSharing,
    refetch: fetchStats,
  };
};
