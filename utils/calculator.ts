import type { HousingType } from "@/data/housing";

export interface CalculatorInput {
  /** 기본 보증금 대비 추가 보증금 (원) */
  additionalDeposit: number;
  /** 사용자가 가진 총 현금 (계약금 포함, 원) */
  myCash: number;
  /** 연 대출금리 (%) */
  annualRatePercent: number;
}

export interface CalculatorResult {
  /** 전환 후 최종 보증금 */
  finalDeposit: number;
  /** 전환 후 월세 */
  finalRent: number;
  /** 계약금 */
  contractAmount: number;
  /** 잔금 = 최종 보증금 - 계약금 */
  balance: number;
  /** 사용자가 입력한 총 현금 */
  myCash: number;
  /** 계약금 제외 후 잔금에 사용할 수 있는 내 현금 */
  myCashForBalance: number;
  /** 필요한 대출금 (최소 0원) */
  requiredLoan: number;
  /** 연 대출금리 (%) */
  annualRatePercent: number;
  /** 예상 월 대출이자 */
  monthlyLoanInterest: number;
  /** 예상 관리비 */
  estimatedManagementFee: number;
  /** 예상 월 주거비 = 월 대출이자 + 월세 + 예상 관리비 */
  monthlyHousingCost: number;
}

/** 주택형별 계약금 계산 방식(고정 금액 / 보증금 비율)에 따라 계약금을 계산한다. */
export function calculateContractAmount(type: HousingType): number {
  const { contract, deposit } = type;
  if (contract.type === "fixed") {
    return contract.value;
  }
  // percentage: 기본 보증금 기준 비율 (보증금을 최대전환해도 계약금은 늘어나지 않음)
  return Math.round((deposit.base * contract.value) / 100);
}

/** 추가 보증금에 따른 전환 후 보증금/월세를 계산한다. */
export function calculateDepositConversion(
  type: HousingType,
  additionalDeposit: number
): { finalDeposit: number; finalRent: number } {
  const { deposit, rent } = type;

  const clampedAdditional = Math.min(
    Math.max(additionalDeposit, 0),
    deposit.maxAdditional
  );

  const finalDeposit = deposit.base + clampedAdditional;
  const steps = clampedAdditional / deposit.step;
  const rentDecrease = steps * rent.decreasePerStep;
  const finalRent = rent.base - rentDecrease;

  return { finalDeposit, finalRent };
}

/** 전체 입력값으로 최종 계산 결과를 산출한다. */
export function calculate(
  type: HousingType,
  estimatedManagementFee: number,
  input: CalculatorInput
): CalculatorResult {
  const { finalDeposit, finalRent } = calculateDepositConversion(
    type,
    input.additionalDeposit
  );

  const contractAmount = calculateContractAmount(type);
  const balance = finalDeposit - contractAmount;
  const myCashForBalance = Math.max(input.myCash - contractAmount, 0);
  const requiredLoan = Math.max(finalDeposit - input.myCash, 0);
  const monthlyLoanInterest =
    (requiredLoan * (input.annualRatePercent / 100)) / 12;
  const monthlyHousingCost =
    monthlyLoanInterest + finalRent + estimatedManagementFee;

  return {
    finalDeposit,
    finalRent,
    contractAmount,
    balance,
    myCash: input.myCash,
    myCashForBalance,
    requiredLoan,
    annualRatePercent: input.annualRatePercent,
    monthlyLoanInterest,
    estimatedManagementFee,
    monthlyHousingCost,
  };
}
