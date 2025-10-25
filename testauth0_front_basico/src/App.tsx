import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Configuración de Auth0
const auth0Config = {
  domain: 'dev-4qv4bs5w32upxtt5.us.auth0.com',
  clientId: 'A343FOgq0hloSROFvzxoXvN2JDMqaTa2',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://web-investment-portfolio-api.com',
    scope: 'openid profile email'
  }
};

// Configuración del backend
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
  const [error, setError] = useState<string>('');

  // Obtener y mostrar el token cuando el usuario esté autenticado
  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          console.log('✅ Token obtenido:', accessToken);
        } catch (error) {
          console.error('❌ Error obteniendo token:', error);
          setError('Error obteniendo token');
        }
      }
    };
    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Probar endpoint público (sin token)
  const testPublicEndpoint = async () => {
    try {
      setError('');
      setPublicApiResponse(null);
      
      console.log('🔍 Probando endpoint público...');
      const response = await axios.get(`${API_URL}/stocks/search/?q=apple`);
      
      setPublicApiResponse(response.data);
      console.log('✅ Respuesta del endpoint público:', response.data);
    } catch (err: any) {
      console.error('❌ Error en endpoint público:', err);
      setError(`Error público: ${err.response?.data?.error || err.message}`);
    }
  };

  // Probar endpoint protegido (con token)
  const testProtectedEndpoint = async () => {
    try {
      setError('');
      setProtectedApiResponse(null);
      
      console.log('🔒 Probando endpoint protegido con token...');
      const response = await axios.get(`${API_URL}/stocks/balance/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProtectedApiResponse(response.data);
      console.log('✅ Respuesta del endpoint protegido:', response.data);
    } catch (err: any) {
      console.error('❌ Error en endpoint protegido:', err);
      setError(`Error protegido: ${err.response?.data?.error || err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Cargando Auth0...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>🔐 Prueba de Auth0 + Django</h1>
        <p>Presiona el botón para iniciar sesión con Auth0</p>
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
          🚀 Login con Auth0
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>✅ Autenticado con Auth0</h1>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px' 
      }}>
        <h2>👤 Datos del Usuario</h2>
        <p><strong>Nombre:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Auth0 ID:</strong> {user?.sub}</p>
        <img 
          src={user?.picture} 
          alt="Avatar" 
          style={{ borderRadius: '50%', width: '80px' }}
        />
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        wordBreak: 'break-all'
      }}>
        <h2>🔑 Token JWT</h2>
        <p style={{ fontSize: '11px', fontFamily: 'monospace' }}>
          {token ? token.substring(0, 150) + '...' : 'No token yet'}
        </p>
      </div>

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
          🌐 Probar Endpoint Público
          <br />
          <small style={{ fontSize: '12px' }}>(stocks/search - sin token)</small>
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
          🔒 Probar Endpoint Protegido
          <br />
          <small style={{ fontSize: '12px' }}>(stocks/balance - con token)</small>
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

      {publicApiResponse && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2>🌐 Respuesta Endpoint Público (sin token)</h2>
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
          <h2>🔒 Respuesta Endpoint Protegido (con token)</h2>
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

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          padding: '20px', 
          borderRadius: '10px',
          color: '#721c24'
        }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
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