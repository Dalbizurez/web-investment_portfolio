import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Config Auth0
const auth0Config = {
  domain: 'dev-4qv4bs5w32upxtt5.us.auth0.com',
  clientId: 'A343FOgq0hloSROFvzxoXvN2JDMqaTa2',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://web-investment-portfolio-api.com',
    scope: 'openid profile email'
  }
};

// Backend URL
const API_URL = 'http://localhost:8000/api';

function TestAuth() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
        } catch (e) {
          setError('Error getting token');
        }
      }
    };
    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};


    // REPORTS
  const requestReport = async () => {
    try {
      const body = {
        date_from: "2025-01-01",
        date_to: "2025-12-31",
        include_current_valuation: true,
        format: "PDF" // or "CSV"
      };

      const res = await axios.post(
        `${API_URL}/stocks/reports/request/`,
        body,
        { headers }
      );

      alert("✅ Report requested:\n" + JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      alert("❌ Report request error:\n" + e.response?.data?.error);
    }
  };

  const reportHistory = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/stocks/reports/history/`,
        { headers }
      );

      alert("📊 Report history:\n" + JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      alert("❌ Report history error:\n" + e.response?.data?.error);
    }
  };







  // STOCK ACTIONS
  const buy = async () => {
    try {
      const res = await axios.post(`${API_URL}/stocks/transactions/buy/`, { symbol: "AAPL", quantity: 1 }, { headers });
      alert("✅ BUY success:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ BUY error: " + e.response?.data?.error); }
  };

  const sell = async () => {
    try {
      const res = await axios.post(`${API_URL}/stocks/transactions/sell/`, { symbol: "AAPL", quantity: 1 }, { headers });
      alert("✅ SELL success:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ SELL error: " + e.response?.data?.error); }
  };

  const deposit = async () => {
    try {
      const res = await axios.post(`${API_URL}/stocks/transactions/deposit/`, { amount: 100000, transfer_reference: "TEST001" }, { headers });
      alert("✅ DEPOSIT success:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ DEPOSIT error: " + e.response?.data?.error); }
  };

  const withdraw = async () => {
    try {
      const res = await axios.post(`${API_URL}/stocks/transactions/withdraw/`, { amount: 50, transfer_reference: "WD001" }, { headers });
      alert("✅ WITHDRAW success:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ WITHDRAW error: " + e.response?.data?.error); }
  };

  const history = async () => {
    try {
      const res = await axios.get(`${API_URL}/stocks/transactions/history/`, { headers });
      alert("📜 HISTORY:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ HISTORY error: " + e.response?.data?.error); }
  };

  const balance = async () => {
    try {
      const res = await axios.get(`${API_URL}/stocks/balance/`, { headers });
      alert("💰 BALANCE:\n" + JSON.stringify(res.data, null, 2));
    } catch (e:any) { alert("❌ BALANCE error: " + e.response?.data?.error); }
  };
  

  // public
  const testPublic = async () => {
    const res = await axios.get(`${API_URL}/stocks/search/?q=apple`);
    alert(JSON.stringify(res.data, null, 2));
  };

  if (isLoading) return <h2>Loading...</h2>;

  if (!isAuthenticated)
    return <button onClick={() => loginWithRedirect()}>Login</button>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth0 Logged in ✅</h2>
      <p>User: {user?.email}</p>
      <h2>Auth0 Logged in ✅</h2>
      <p>User: {user?.email}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap:'wrap', gap: 10 }}>
        <button onClick={deposit}>💵 Deposit 100</button>
        <button onClick={withdraw}>🏧 Withdraw 50</button>
        <button onClick={buy}>🟩 Buy 1 AAPL</button>
        <button onClick={sell}>🟥 Sell 1 AAPL</button>
        <button onClick={balance}>💰 Balance</button>
        <button onClick={history}>📜 Transaction History</button>
        <button onClick={testPublic}>🌐 Public Search</button>
        <button onClick={requestReport}>📩 Request Report</button>
        <button onClick={reportHistory}>📊 Report History</button>
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <TestAuth />
    </Auth0Provider>
  );
}
