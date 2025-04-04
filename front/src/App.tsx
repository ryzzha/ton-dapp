import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import './App.css';
import { fromNano } from 'ton-core';
import { useTonConnect } from './hooks/useTonConnect';
import { ChangeCounterForm } from './components/CounterChangeForm';
import { TransferForm } from './components/TransferForm';

function App() {
  const { address, balance, counter, sender, owner, sendChangeIncrement, sendDeposit, sendWithdraw } = useMainContract();
  const { connected } = useTonConnect();

  return (
    <div className="app-container">
      <header>
        <h1>🚀 Build on TON</h1>
        <TonConnectButton className="ton-button" />
      </header>

      <main className="info-panel">
        <p><strong>Contract address:</strong> {address || 'Not connected'}</p>
        <p><strong>Balance:</strong> {fromNano(balance?.toString() ?? '0')} TON</p>
        <p><strong>Counter value:</strong> {counter ?? 0}</p>
        <p><strong>Sender:</strong> {sender?.toString() || 'N/A'}</p>
        <p><strong>Contract owner:</strong> {owner?.toString() || 'N/A'}</p>
      </main>

      {connected ?  <ChangeCounterForm onSubmit={sendChangeIncrement}  /> : <p>connect wallet to change counter</p>}
      {connected ?  <TransferForm onDeposit={sendDeposit} onWithdraw={sendWithdraw}/> : <p>connect wallet to deposit/withdraw</p>}
    </div>
  );
}

export default App;
