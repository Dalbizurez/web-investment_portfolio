import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Auth0 Configuration
const auth0Config = {
  domain: 'dev-4qv4bs5w32upxtt5.us.auth0.com',
  clientId: 'A343FOgq0hloSROFvzxoXvN2JDMqaTa2',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://web-investment-portfolio-api.com',
    scope: 'openid profile email'
  }
};

// Backend Configuration
const API_URL = 'http://localhost:8000/api';

function TestAuth() {
  const { 
    loginWithRedirect, 
    logout, 
    isAuthenticated, 
    isLoading,
    getAccessTokenSilently,
    user 
  } = useAuth0();

  const [token, setToken] = useState<string>('');
  const [publicApiResponse, setPublicApiResponse] = useState<any>(null);
  const [protectedApiResponse, setProtectedApiResponse] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Get token when user is authenticated
  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          console.log('✅ Token obtained:', accessToken);
          
          // Automatically fetch user profile
          fetchUserProfile(accessToken);
        } catch (error) {
          console.error('❌ Error getting token:', error);
          setError('Error getting token');
        }
      }
    };
    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Fetch user profile
  const fetchUserProfile = async (accessToken?: string) => {
    try {
      setError('');
      const tokenToUse = accessToken || token;
      
      console.log('👤 Fetching user profile...');
      const response = await axios.get(`${API_URL}/user_try/profile/`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });
      
      setUserProfile(response.data);
      console.log('✅ User profile:', response.data);
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      if (err.response?.status === 401) {
        setError('User not created yet. Click "Test Protected Endpoint" to create user.');
      } else {
        setError(`Error fetching profile: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  // Fetch referral statistics
  const fetchReferralStats = async () => {
    try {
      setError('');
      setSuccess('');
      
      console.log('📊 Fetching referral stats...');
      const response = await axios.get(`${API_URL}/user_try/referral/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReferralStats(response.data);
      console.log('✅ Referral stats:', response.data);
      setSuccess('Referral stats loaded successfully!');
    } catch (err: any) {
      console.error('❌ Error fetching referral stats:', err);
      setError(`Error fetching referral stats: ${err.response?.data?.error || err.message}`);
    }
  };

  // Use referral code
  const useReferralCode = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!referralCodeInput.trim()) {
        setError('Please enter a referral code');
        return;
      }
      
      console.log('🎁 Using referral code:', referralCodeInput);
      const response = await axios.post(
        `${API_URL}/user_try/referral/use-code/`,
        { referral_code: referralCodeInput.toUpperCase().trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Referral code applied:', response.data);
      setSuccess(`🎉 ${response.data.message}! You received $${response.data.bonus_received}. New balance: $${response.data.your_new_balance}`);
      setReferralCodeInput('');
      
      // Refresh profile and stats
      await fetchUserProfile();
      await fetchReferralStats();
    } catch (err: any) {
      console.error('❌ Error using referral code:', err);
      setError(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Test public endpoint
  const testPublicEndpoint = async () => {
    try {
      setError('');
      setSuccess('');
      setPublicApiResponse(null);
      
      console.log('🔍 Testing public endpoint...');
      const response = await axios.get(`${API_URL}/stocks/search/?q=apple`);
      
      setPublicApiResponse(response.data);
      console.log('✅ Public endpoint response:', response.data);
      setSuccess('Public endpoint works!');
    } catch (err: any) {
      console.error('❌ Error in public endpoint:', err);
      setError(`Public error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Test protected endpoint (creates user if doesn't exist)
  const testProtectedEndpoint = async () => {
    try {
      setError('');
      setSuccess('');
      setProtectedApiResponse(null);
      
      console.log('🔒 Testing protected endpoint with token...');
      const response = await axios.get(`${API_URL}/stocks/balance/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProtectedApiResponse(response.data);
      console.log('✅ Protected endpoint response:', response.data);
      setSuccess('Protected endpoint works! User created if needed.');
      
      // Refresh profile
      await fetchUserProfile();
    } catch (err: any) {
      console.error('❌ Error in protected endpoint:', err);
      setError(`Protected error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Loading Auth0...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>🔐 Auth0 + Django Referral System Test</h1>
        <p>Click the button to login with Auth0</p>
        <button 
          onClick={() => loginWithRedirect()}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🚀 Login with Auth0
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>✅ Authenticated with Auth0</h1>
      
      {/* User Info */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px' 
      }}>
        <h2>👤 Auth0 User Data</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Auth0 ID:</strong> {user?.sub}</p>
        <img 
          src={user?.picture} 
          alt="Avatar" 
          style={{ borderRadius: '50%', width: '80px' }}
        />
      </div>

      {/* User Profile from Backend */}
      {userProfile && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px' 
        }}>
          <h2>👤 Backend User Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>Username:</strong> {userProfile.username}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Type:</strong> {userProfile.type}</p>
            <p><strong>Status:</strong> {userProfile.status}</p>
            <p><strong>Language:</strong> {userProfile.language}</p>
            <p><strong>Created:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
          </div>
          <div style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white',
            padding: '15px', 
            borderRadius: '5px',
            marginTop: '15px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🎟️ YOUR REFERRAL CODE: {userProfile.referral_code}
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Share this code with friends! You earn $8 for each person who uses it.
          </p>
          <p><strong>Used Referral:</strong> {userProfile.has_used_referral ? '✅ Yes' : '❌ Not yet'}</p>
          <p><strong>Successful Referrals:</strong> {userProfile.referral_count || 0} people</p>
        </div>
      )}

      {/* Referral Code Input Section */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px' 
      }}>
        <h2>🎁 Use a Referral Code</h2>
        <p>Got a referral code? Enter it here to get your $5 bonus!</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input
            type="text"
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code (e.g., ABC12345)"
            disabled={userProfile?.has_used_referral}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              textTransform: 'uppercase'
            }}
          />
          <button 
            onClick={useReferralCode}
            disabled={!token || !referralCodeInput.trim() || userProfile?.has_used_referral}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: (!token || !referralCodeInput.trim() || userProfile?.has_used_referral) ? 'not-allowed' : 'pointer',
              opacity: (!token || !referralCodeInput.trim() || userProfile?.has_used_referral) ? 0.6 : 1
            }}
          >
            🎁 Apply Code
          </button>
        </div>
        {userProfile?.has_used_referral && (
          <p style={{ marginTop: '10px', color: '#856404', fontWeight: 'bold' }}>
            ℹ️ You have already used a referral code. You can only use one code per account.
          </p>
        )}
      </div>

      {/* Referral Stats Section */}
      {referralStats && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px' 
        }}>
          <h2>📊 Your Referral Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>Your Referral Code</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{referralStats.referral_code}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>Successful Referrals</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{referralStats.successful_referrals}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <p style={{ fontSize: '14px', color: '#666' }}>Total Earnings</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>${referralStats.total_earnings}</p>
            </div>
          </div>
          
          {referralStats.referred_by && (
            <p style={{ marginTop: '15px' }}>
              <strong>Referred by:</strong> {referralStats.referred_by}
            </p>
          )}
          
          {referralStats.referred_users && referralStats.referred_users.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>👥 People You Referred:</h3>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
                {referralStats.referred_users.map((user: any, index: number) => (
                  <div key={user.id} style={{ 
                    padding: '10px',
                    borderBottom: index < referralStats.referred_users.length - 1 ? '1px solid #ddd' : 'none'
                  }}>
                    <p><strong>{user.username}</strong> ({user.email})</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Status: {user.status} | Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testPublicEndpoint}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🌐 Test Public Endpoint
          <br />
          <small style={{ fontSize: '12px' }}>(stocks/search - no token)</small>
        </button>

        <button 
          onClick={testProtectedEndpoint}
          disabled={!token}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: token ? 'pointer' : 'not-allowed',
            opacity: token ? 1 : 0.6
          }}
        >
          🔒 Test Protected Endpoint
          <br />
          <small style={{ fontSize: '12px' }}>(stocks/balance - creates user)</small>
        </button>

        <button 
          onClick={fetchReferralStats}
          disabled={!token}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: token ? 'pointer' : 'not-allowed',
            opacity: token ? 1 : 0.6
          }}
        >
          📊 Load Referral Stats
          <br />
          <small style={{ fontSize: '12px' }}>(user_try/referral/stats)</small>
        </button>

        <button 
          onClick={() => fetchUserProfile()}
          disabled={!token}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: token ? 'pointer' : 'not-allowed',
            opacity: token ? 1 : 0.6
          }}
        >
          🔄 Refresh Profile
          <br />
          <small style={{ fontSize: '12px' }}>(user_try/profile)</small>
        </button>

        <button 
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px',
          color: '#155724',
          border: '2px solid #c3e6cb'
        }}>
          <h2>✅ Success</h2>
          <p>{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          padding: '20px', 
          borderRadius: '10px',
          color: '#721c24',
          marginBottom: '20px',
          border: '2px solid #f5c6cb'
        }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* API Responses */}
      {publicApiResponse && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>🌐 Public Endpoint Response</h2>
          <p><strong>Endpoint:</strong> GET /api/stocks/search/?q=apple</p>
          <pre style={{ 
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(publicApiResponse, null, 2)}
          </pre>
        </div>
      )}

      {protectedApiResponse && (
        <div style={{ 
          backgroundColor: '#cfe2ff', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>🔒 Protected Endpoint Response</h2>
          <p><strong>Endpoint:</strong> GET /api/stocks/balance/</p>
          <pre style={{ 
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(protectedApiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <TestAuth />
    </Auth0Provider>
  );
}

export default App;