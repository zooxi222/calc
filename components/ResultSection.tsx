import type { HousingType } from "@/data/housing";
import type { CalculatorResult } from "@/utils/calculator";
import { calculateDepositConversion } from "@/utils/calculator";
import { formatWon } from "@/utils/format";

interface Props {
  type: HousingType;
  result: CalculatorResult;
}

export default function ResultSection({ type, result }: Props) {
  const baseline = calculateDepositConversion(type, 0);
  const maxed = calculateDepositConversion(type, type.deposit.maxAdditional);

  return (
    <section className="result-section">
      <h2 className="step-title">4. 결과</h2>

      <div className="highlight-card">
        <p className="highlight-label">예상 월 주거비</p>
        <p className="highlight-value">{formatWon(result.monthlyHousingCost)}</p>

        <div className="highlight-breakdown">
          <div className="breakdown-row">
            <span>대출이자</span>
            <span>{formatWon(result.monthlyLoanInterest)}</span>
          </div>
          <div className="breakdown-row">
            <span>월세</span>
            <span>{formatWon(result.finalRent)}</span>
          </div>
          <div className="breakdown-row">
            <span>예상 관리비</span>
            <span>{formatWon(result.estimatedManagementFee)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="sub-title">자금 구조</h3>
        <div className="fact-row">
          <span>전환 후 보증금</span>
          <strong>{formatWon(result.finalDeposit)}</strong>
        </div>
        <div className="fact-row">
          <span>계약금</span>
          <strong>{formatWon(result.contractAmount)}</strong>
        </div>
        <div className="fact-row">
          <span>잔금 (보증금 − 계약금)</span>
          <strong>{formatWon(result.balance)}</strong>
        </div>
        <div className="fact-row">
          <span>내가 가진 현금</span>
          <strong>{formatWon(result.myCash)}</strong>
        </div>
        <div className="fact-row">
          <span>잔금에 사용 가능한 내 현금</span>
          <strong>{formatWon(result.myCashForBalance)}</strong>
        </div>
        <div className="fact-row highlight-fact">
          <span>필요 대출금</span>
          <strong>{formatWon(result.requiredLoan)}</strong>
        </div>
        <div className="fact-row">
          <span>연 대출금리</span>
          <strong>{result.annualRatePercent}%</strong>
        </div>
      </div>

      <div className="card">
        <h3 className="sub-title">기본형 · 내 선택 · 최대전환형 비교</h3>
        <div className="comparison-grid">
          <div className="comparison-col">
            <p className="comparison-label">기본형</p>
            <p>{formatWon(baseline.finalDeposit)}</p>
            <p>{formatWon(baseline.finalRent)}</p>
          </div>
          <div className="comparison-col comparison-col-selected">
            <p className="comparison-label">내 선택</p>
            <p>{formatWon(result.finalDeposit)}</p>
            <p>{formatWon(result.finalRent)}</p>
          </div>
          <div className="comparison-col">
            <p className="comparison-label">최대전환형</p>
            <p>{formatWon(maxed.finalDeposit)}</p>
            <p>{formatWon(maxed.finalRent)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
