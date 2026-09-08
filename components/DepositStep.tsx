"use client";

import type { HousingType } from "@/data/housing";
import { calculateDepositConversion } from "@/utils/calculator";
import { formatWon } from "@/utils/format";

interface Props {
  type: HousingType;
  additionalDeposit: number;
  onChange: (value: number) => void;
}

export default function DepositStep({ type, additionalDeposit, onChange }: Props) {
  const { deposit } = type;
  const { finalDeposit, finalRent } = calculateDepositConversion(
    type,
    additionalDeposit
  );

  const clamp = (value: number) =>
    Math.min(Math.max(value, 0), deposit.maxAdditional);

  const handleStep = (direction: 1 | -1) => {
    onChange(clamp(additionalDeposit + direction * deposit.step));
  };

  return (
    <section className="card">
      <h2 className="step-title">1. 보증금 얼마나 올릴까요?</h2>

      <div className="deposit-amount-row">
        <span className="deposit-label">추가 보증금</span>
        <span className="deposit-value">+ {formatWon(additionalDeposit)}</span>
      </div>

      <div className="stepper-row">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => handleStep(-1)}
          disabled={additionalDeposit <= 0}
          aria-label="보증금 감소"
        >
          −
        </button>

        <input
          type="range"
          className="slider"
          min={0}
          max={deposit.maxAdditional}
          step={deposit.step}
          value={additionalDeposit}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          aria-label="추가 보증금 슬라이더"
        />

        <button
          type="button"
          className="stepper-btn"
          onClick={() => handleStep(1)}
          disabled={additionalDeposit >= deposit.maxAdditional}
          aria-label="보증금 증가"
        >
          +
        </button>
      </div>

      <div className="range-hint">
        <span>0원</span>
        <span>최대 {formatWon(deposit.maxAdditional)}</span>
      </div>

      <div className="conversion-preview">
        <div className="conversion-item">
          <span>전환 후 보증금</span>
          <strong>{formatWon(finalDeposit)}</strong>
        </div>
        <div className="conversion-item">
          <span>전환 후 월세</span>
          <strong>{formatWon(finalRent)}</strong>
        </div>
      </div>
    </section>
  );
}
