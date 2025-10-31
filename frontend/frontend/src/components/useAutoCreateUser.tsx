import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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

  const fetchUserProfile = async (accessToken: string) => {
    try {
      setIsLoadingProfile(true);
      setError(null);

      const response = await axios.get(`${API_URL}/user_try/profile/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setUserProfile(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        await axios.post(`${API_URL}/user_try/create/`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const newProfile = await axios.get(`${API_URL}/user_try/profile/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        setUserProfile(newProfile.data);
      } else {
        setError(err.message || 'Error fetching profile');
      }
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