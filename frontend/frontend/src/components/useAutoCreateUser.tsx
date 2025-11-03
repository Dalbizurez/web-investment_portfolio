import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const REF_BASE = "http://localhost:8000/api/user_try";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  auth0_id: string;
  type: string;
  status: string;
  language: string;
  created_at: string;
  referral_code: string;
  has_used_referral: boolean;
  referral_count: number;
}

export const useAutoCreateUser = () => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const tryApplyReferralFromURL = async (accessToken: string, profile: UserProfile) => {
    try {
      const url = new URL(window.location.href);
      const refParam = url.searchParams.get("ref");

      if (!refParam) return;

      const code = refParam.toUpperCase();

      // ❌ No te puedes referir a ti mismo
      if (code === profile.referral_code) return;

      // ❌ Solo si aún no usó un código
      if (profile.has_used_referral) return;

      const payload = { referral_code: code };

      const endpoints = [
        `${REF_BASE}/referral/use-code/`,
        `${REF_BASE}/use-referral-code/`
      ];

      for (const endpoint of endpoints) {
        try {
          await axios.post(endpoint, payload, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          console.log("✅ Referral from URL applied:", code);
          
          // Clean URL to avoid reapplying
          url.searchParams.delete("ref");
          window.history.replaceState({}, "", url.toString());

          break;
        } catch {
          // try next endpoint
        }
      }
    } catch (error) {
      console.error("Error applying referral from URL:", error);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      setIsLoadingProfile(true);
      setError(null);

      let response;
      try {
        response = await axios.get(`${API_URL}/user_try/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          await axios.post(`${API_URL}/user_try/create/`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          response = await axios.get(`${API_URL}/user_try/profile/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        } else {
          throw err;
        }
      }

      const profile: UserProfile = response.data;
      setUserProfile(profile);

      // ✅ Después de obtener perfil, intentar aplicar código en URL
      await tryApplyReferralFromURL(accessToken, profile);

    } catch (err: any) {
      setError(err.message || 'Error fetching user profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && user) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          await fetchUserProfile(accessToken);
        } catch (err: any) {
          console.error('Error getting token:', err);
          setError('Error al obtener token de Auth0');
        }
      } else {
        setUserProfile(null);
        setToken(null);
        setError(null);
      }
    };

    initializeUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const refetchProfile = async () => {
    if (token) await fetchUserProfile(token);
  };

  return { userProfile, isLoadingProfile, error, token, refetchProfile };
};
