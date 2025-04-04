import { useState } from 'react';
import './TransferForm.css';
import { useTonConnect } from '../hooks/useTonConnect';
import { useMainContract } from '../hooks/useMainContract';
import { Address } from 'ton-core';

interface TransferFormProps {
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export function TransferForm({ onDeposit, onWithdraw }: TransferFormProps) {
  const { wallet } = useTonConnect();
  const { owner } = useMainContract();
  const [amount, setAmount] = useState(0);
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

  const isOwner =
    wallet &&
    owner &&
    Address.parse(wallet).toString() === owner.toString();

  const handleSubmit = () => {
    if (amount <= 0) return;

    if(action == 'deposit') onDeposit(amount);
    if(action == 'withdraw') onWithdraw(amount);;
  };

  return (
    <div className="transfer-panel">
      <input
        type="number"
        value={amount}
        min={0}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount in TON"
      />

      <div className="action-buttons">
        <button
          className={action === 'deposit' ? 'selected' : ''}
          onClick={() => setAction('deposit')}
        >
          💸 Deposit
        </button>
        <button
          className={action === 'withdraw' ? 'selected' : ''}
          onClick={() => setAction('withdraw')}
        >
           {isOwner ? "🏧 Withdraw" : "only owner wallet can withdraw"}
        </button>
      </div>

      <button className="send-button" onClick={handleSubmit}>
        ✅ Submit
      </button>
    </div>
  );
}
