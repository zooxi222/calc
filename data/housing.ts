// 단지별로 달라지는 값은 전부 이 파일에서만 관리한다.
// 다른 LH/SH 행복주택 계산기로 재사용하려면 이 파일의 값만 교체하면 된다.

export type ContractType = "fixed" | "percentage";

export interface ContractConfig {
  /** "fixed": 고정 금액 / "percentage": 기본 보증금의 n% */
  type: ContractType;
  /** type이 "fixed"면 원 단위 금액, "percentage"면 퍼센트 값(예: 10 = 10%) */
  value: number;
}

export interface DepositConfig {
  /** 기본 보증금 (원) */
  base: number;
  /** 최대전환 보증금 (원) */
  max: number;
  /** 보증금 증액 단위 (원) */
  step: number;
  /** 기본 보증금 대비 최대 추가 가능 보증금 (원) = max - base */
  maxAdditional: number;
}

export interface RentConfig {
  /** 기본 월세 (원) */
  base: number;
  /** 최대전환 월세 (원, 검증용) */
  min: number;
  /** 보증금 1 step 증액 시 월세 감소액 (원) */
  decreasePerStep: number;
}

/** 하나의 주택형(예: "36형") 데이터 */
export interface HousingType {
  id: string;
  name: string;
  /** 전용면적 (㎡) */
  area: number;
  deposit: DepositConfig;
  rent: RentConfig;
  contract: ContractConfig;
}

/** 공급대상 하나(예: "신혼부부")와 그에 속한 주택형 목록 */
export interface HousingCategory {
  id: string;
  name: string;
  types: HousingType[];
}

export interface HousingData {
  title: string;
  housingName: string;
  /** 예상 관리비 (원) */
  estimatedManagementFee: number;
  categories: HousingCategory[];
  /** URL 파라미터가 없거나 유효하지 않을 때 사용할 기본 공급대상/주택형 */
  defaultCategoryId: string;
  defaultTypeId: string;
}

function makeType(params: {
  id: string;
  name: string;
  area: number;
  depositBase: number;
  rentBase: number;
  maxAdditional: number;
  depositStep?: number;
  decreasePerStep?: number;
}): HousingType {
  const depositStep = params.depositStep ?? 1_000_000;
  const decreasePerStep = params.decreasePerStep ?? 5_000;

  // 계약금은 2026.05.15 공고 기준 모든 공급대상/주택형에서 "기본 보증금의 10%"로
  // 일관되며, 보증금을 최대전환해도 증가하지 않는다.
  return {
    id: params.id,
    name: params.name,
    area: params.area,
    deposit: {
      base: params.depositBase,
      max: params.depositBase + params.maxAdditional,
      step: depositStep,
      maxAdditional: params.maxAdditional,
    },
    rent: {
      base: params.rentBase,
      min: params.rentBase - (params.maxAdditional / depositStep) * decreasePerStep,
      decreasePerStep,
    },
    contract: {
      type: "percentage",
      value: 10,
    },
  };
}

export const oryuHousing: HousingData = {
  title: "오류동 LH 행복주택 보증금 월세 계산기",
  housingName: "서울 오류 행복주택",
  estimatedManagementFee: 150_000,
  defaultCategoryId: "newlywed",
  defaultTypeId: "36",
  categories: [
    {
      id: "student",
      name: "대학생",
      types: [
        makeType({
          id: "16",
          name: "16형",
          area: 16.84,
          depositBase: 47_600_000,
          rentBase: 202_300,
          maxAdditional: 24_000_000,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 74_460_000,
          rentBase: 316_450,
          maxAdditional: 37_000_000,
        }),
      ],
    },
    {
      id: "youth",
      name: "청년",
      types: [
        makeType({
          id: "16",
          name: "16형",
          area: 16.84,
          depositBase: 50_400_000,
          rentBase: 214_200,
          maxAdditional: 25_000_000,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 78_840_000,
          rentBase: 335_070,
          maxAdditional: 40_000_000,
        }),
      ],
    },
    {
      id: "senior",
      name: "고령자(주거약자용)",
      types: [
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 83_220_000,
          rentBase: 353_680,
          maxAdditional: 42_000_000,
        }),
        makeType({
          id: "36",
          name: "36형",
          area: 36.85,
          depositBase: 100_320_000,
          rentBase: 426_360,
          maxAdditional: 51_000_000,
        }),
      ],
    },
    {
      id: "welfare",
      name: "주거급여수급자",
      types: [
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 65_700_000,
          rentBase: 279_220,
          maxAdditional: 33_000_000,
        }),
      ],
    },
    {
      id: "newlywed",
      name: "신혼부부",
      types: [
        makeType({
          id: "36",
          name: "36형",
          area: 36.85,
          depositBase: 105_600_000,
          rentBase: 448_800,
          maxAdditional: 53_000_000,
        }),
      ],
    },
  ],
};

// 현재 페이지에서 사용할 활성 housing 데이터.
// 다른 단지로 교체하려면 이 export만 바꾸면 된다.
export const activeHousing: HousingData = oryuHousing;

export interface HousingSelection {
  category: HousingCategory;
  type: HousingType;
}

/**
 * URL 파라미터(category, type)로부터 실제 선택값을 계산한다.
 * - category가 존재하지 않으면 기본 공급대상/주택형으로 fallback.
 * - category는 존재하지만 type이 그 안에 없으면 해당 category의 첫 번째 주택형을 선택.
 */
export function resolveHousingSelection(
  housing: HousingData,
  categoryId?: string | null,
  typeId?: string | null
): HousingSelection {
  const category = housing.categories.find((c) => c.id === categoryId);

  if (!category) {
    const defaultCategory =
      housing.categories.find((c) => c.id === housing.defaultCategoryId) ??
      housing.categories[0];
    const defaultType =
      defaultCategory.types.find((t) => t.id === housing.defaultTypeId) ??
      defaultCategory.types[0];
    return { category: defaultCategory, type: defaultType };
  }

  const type = category.types.find((t) => t.id === typeId) ?? category.types[0];
  return { category, type };
}
