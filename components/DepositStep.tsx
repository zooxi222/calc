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
    Math.min(Math.max(value, -deposit.maxReduction), deposit.maxAdditional);

  const handleStep = (direction: 1 | -1) => {
    onChange(clamp(additionalDeposit + direction * deposit.step));
  };

  const sign = additionalDeposit > 0 ? "+" : additionalDeposit < 0 ? "-" : "";

  return (
    <section className="card">
      <h2 className="step-title">1. 보증금 얼마나 올리거나 낮출까요?</h2>

      <div className="deposit-amount-row">
        <span className="deposit-label">추가/감액 보증금</span>
        <span className="deposit-value">
          {sign} {formatWon(Math.abs(additionalDeposit))}
        </span>
      </div>

      <div className="stepper-row">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => handleStep(-1)}
          disabled={additionalDeposit <= -deposit.maxReduction}
          aria-label="보증금 감소"
        >
          −
        </button>

        <input
          type="range"
          className="slider"
          min={-deposit.maxReduction}
          max={deposit.maxAdditional}
          step={deposit.step}
          value={additionalDeposit}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          aria-label="추가/감액 보증금 슬라이더"
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
        <span>최저 -{formatWon(deposit.maxReduction)}</span>
        <span>최대 +{formatWon(deposit.maxAdditional)}</span>
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
