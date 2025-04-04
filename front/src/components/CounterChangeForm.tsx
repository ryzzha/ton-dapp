import { useState } from 'react';
import './ChangeCounterForm.css';

interface ChangeCounterFormProps {
  onSubmit: (value: number, action: "increment" | "decrement") => void;
}

export function ChangeCounterForm({ onSubmit }: ChangeCounterFormProps) {
  const [value, setValue] = useState(1);
  const [action, setAction] = useState<"increment" | "decrement">('increment');

  const handleSubmit = () => {
    if (value <= 0) return;
    onSubmit(value, action);
  };

  return (
    <div className="counter-panel">
      <input
        type="number"
        value={value}
        min={1}
        onChange={(e) => setValue(Number(e.target.value))}
      />

      <div className="action-buttons">
        <button
          className={action === 'increment' ? 'selected' : ''}
          onClick={() => setAction('increment')}
        >
          ➕ Increment
        </button>
        <button
          className={action === 'decrement' ? 'selected' : ''}
          onClick={() => setAction('decrement')}
        >
          ➖ Decrement
        </button>
      </div>

      <button className="send-button" onClick={handleSubmit}>
        ✅ Apply
      </button>
    </div>
  )
}
