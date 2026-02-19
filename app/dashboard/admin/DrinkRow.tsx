"use client";

import { useState } from "react";

type Props = {
  userId: number;
  drinkId: number;
  name: string;
  amount: number;
  onSaved: () => void;
};

export default function DrinkRow({
  userId,
  drinkId,
  name,
  amount,
  onSaved,
}: Props) {
  const [value, setValue] = useState(amount);
  const [saving, setSaving] = useState(false);

  const changed = value !== amount;

  async function save() {
    const ok = confirm(
      `Getränk "${name}" auf ${value} setzen?`
    );
    if (!ok) return;

    setSaving(true);

    await fetch("/api/admin/drinks/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        drinkId,
        amount: value,
      }),
    });

    setSaving(false);
    onSaved();
  }

  async function reset() {
    const ok = confirm(
      `Getränk "${name}" wirklich auf 0 setzen?`
    );
    if (!ok) return;

    setSaving(true);

    await fetch("/api/admin/drinks/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        drinkId,
        amount: 0,
      }),
    });

    setSaving(false);
    onSaved();
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="flex-1">{name}</span>

      <button onClick={() => setValue(Math.max(0, value - 1))}>
        –
      </button>

      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) =>
          setValue(Math.max(0, Number(e.target.value)))
        }
        className="w-16 text-center border rounded"
      />

      <button onClick={() => setValue(value + 1)}>
        +
      </button>

      <button
        disabled={!changed || saving}
        onClick={save}
        className={`px-2 py-1 rounded text-sm ${
          changed
            ? "bg-green-600 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        ✔
      </button>

      <button
        onClick={reset}
        className="text-red-600 text-sm"
      >
        Reset
      </button>
    </div>
  );
}
