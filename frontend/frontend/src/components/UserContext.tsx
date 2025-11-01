
import React, { createContext, useContext, ReactNode } from 'react';
import { useAutoCreateUser } from './useAutoCreateUser';

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

interface UserContextType {
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  error: string | null;
  token: string | null;
  refetchProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const userState = useAutoCreateUser();

  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
