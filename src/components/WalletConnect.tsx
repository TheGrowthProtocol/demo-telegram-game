import React, { useState } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    try {
      // Replace this with your actual wallet connection logic
      const account = null; // Connect to wallet here
      if (account) {
        setWalletAddress(account);
        onConnect?.(account);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="wallet-connect">
      {!walletAddress ? (
        <button
          onClick={handleConnect}
          className="connect-button"
          style={{
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: 'Arial',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#45a049';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#4CAF50';
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-status" style={{
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'Arial',
        }}>
          Connected: {shortenAddress(walletAddress)}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;