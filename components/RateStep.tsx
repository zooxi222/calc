"use client";

interface Props {
  annualRatePercent: number | "";
  onChange: (value: number | "") => void;
}

export default function RateStep({ annualRatePercent, onChange }: Props) {
  const handleInput = (raw: string) => {
    if (raw === "") {
      onChange("");
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onChange(parsed);
  };

  return (
    <section className="card">
      <h2 className="step-title">3. 대출 금리는 몇 %인가요?</h2>

      <div className="input-with-unit">
        <input
          type="number"
          inputMode="decimal"
          className="text-input"
          placeholder="예: 3.2"
          value={annualRatePercent}
          onChange={(e) => handleInput(e.target.value)}
          min={0}
          step={0.1}
        />
        <span className="unit-label">%</span>
      </div>
    </section>
  );
}
