"use client";

import { formatManwonFromMillion } from "@/utils/format";

interface Props {
  myCashMillion: number | "";
  onChange: (value: number | "") => void;
}

export default function CashStep({ myCashMillion, onChange }: Props) {
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
      <h2 className="step-title">2. 지금 사용할 수 있는 내 돈은 얼마인가요?</h2>
      <p className="step-desc">계약금을 포함한 총 자기자본을 입력해주세요.</p>

      <div className="input-with-unit">
        <input
          type="number"
          inputMode="decimal"
          className="text-input"
          placeholder="예: 20"
          value={myCashMillion}
          onChange={(e) => handleInput(e.target.value)}
          min={0}
        />
        <span className="unit-label">백만원</span>
      </div>

      <p className="input-hint">
        {typeof myCashMillion === "number" && myCashMillion > 0
          ? formatManwonFromMillion(myCashMillion)
          : "숫자만 입력해주세요 (예: 12 → 1,200만원)"}
      </p>
    </section>
  );
}
