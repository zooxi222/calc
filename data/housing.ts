// 단지별/연도별로 달라지는 값은 전부 이 파일에서만 관리한다.
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
  /** 최저전환 보증금 (원) */
  min: number;
  /** 보증금 증액/감액 단위 (원) */
  step: number;
  /** 기본 보증금 대비 최대 추가 가능 보증금 (원) = max - base */
  maxAdditional: number;
  /** 기본 보증금 대비 최대 감액 가능 보증금 (원, 양수) = base - min */
  maxReduction: number;
}

export interface RentConfig {
  /** 기본 월세 (원) */
  base: number;
  /** 최대전환(보증금 ↑) 시 월세 (원) */
  min: number;
  /** 최저전환(보증금 ↓) 시 월세 (원) */
  max: number;
  /** 보증금 1 step 증액 시 월세 감소액 (원) */
  decreasePerStep: number;
  /** 보증금 1 step 감액 시 월세 증가액 (원) */
  increasePerStep: number;
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
  /** 공고 기준을 보여주기 위한 라벨 (예: "2026년 5월 15일 공고 기준") */
  noticeLabel: string;
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
  /** 최대전환 시 추가되는 보증금 (원) */
  maxAdditional: number;
  /** 최대전환 시 월세 (원) */
  rentAtMax: number;
  /** 최저전환 시 감액되는 보증금 (원, 양수) */
  maxReduction: number;
  /** 최저전환 시 월세 (원) */
  rentAtMin: number;
  depositStep?: number;
}): HousingType {
  const depositStep = params.depositStep ?? 1_000_000;

  const upSteps = params.maxAdditional / depositStep;
  const downSteps = params.maxReduction / depositStep;
  const decreasePerStep = (params.rentBase - params.rentAtMax) / upSteps;
  const increasePerStep = (params.rentAtMin - params.rentBase) / downSteps;

  // 계약금은 모든 공급대상/주택형에서 "기본 보증금의 10%"로 일관되며,
  // 보증금을 최대/최저로 전환해도 변하지 않는다.
  return {
    id: params.id,
    name: params.name,
    area: params.area,
    deposit: {
      base: params.depositBase,
      max: params.depositBase + params.maxAdditional,
      min: params.depositBase - params.maxReduction,
      step: depositStep,
      maxAdditional: params.maxAdditional,
      maxReduction: params.maxReduction,
    },
    rent: {
      base: params.rentBase,
      min: params.rentAtMax,
      max: params.rentAtMin,
      decreasePerStep,
      increasePerStep,
    },
    contract: {
      type: "percentage",
      value: 10,
    },
  };
}

// ---- 2026.05.15 공고 기준 (44형 없음, 고령자 36형 있음) ----
export const oryuHousing2026: HousingData = {
  title: "오류동 LH 행복주택 보증금 월세 계산기",
  housingName: "서울 오류 행복주택",
  noticeLabel: "2026년 5월 15일 공고 기준",
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
          rentAtMax: 82_300,
          maxReduction: 39_000_000,
          rentAtMin: 316_050,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 74_460_000,
          rentBase: 316_450,
          maxAdditional: 37_000_000,
          rentAtMax: 131_450,
          maxReduction: 62_000_000,
          rentAtMin: 497_280,
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
          rentAtMax: 89_200,
          maxReduction: 42_000_000,
          rentAtMin: 336_700,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 78_840_000,
          rentBase: 335_070,
          maxAdditional: 40_000_000,
          rentAtMax: 135_070,
          maxReduction: 66_000_000,
          rentAtMin: 527_570,
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
          rentAtMax: 143_680,
          maxReduction: 69_000_000,
          rentAtMin: 554_930,
        }),
        makeType({
          id: "36",
          name: "36형",
          area: 36.85,
          depositBase: 100_320_000,
          rentBase: 426_360,
          maxAdditional: 51_000_000,
          rentAtMax: 171_360,
          maxReduction: 84_000_000,
          rentAtMin: 671_360,
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
          rentAtMax: 114_220,
          maxReduction: 55_000_000,
          rentAtMin: 439_630,
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
          rentAtMax: 183_800,
          maxReduction: 88_000_000,
          rentAtMin: 705_460,
        }),
      ],
    },
  ],
};

// ---- 2025년 공고 기준 (44형 있음, 고령자 36형 없음) ----
export const oryuHousing2025: HousingData = {
  title: "오류동 LH 행복주택 보증금 월세 계산기",
  housingName: "서울 오류 행복주택",
  noticeLabel: "2025년 공고 기준",
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
          depositBase: 47_260_000,
          rentBase: 208_730,
          maxAdditional: 21_000_000,
          rentAtMax: 86_230,
          maxReduction: 39_000_000,
          rentAtMin: 322_480,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 73_440_000,
          rentBase: 324_360,
          maxAdditional: 33_000_000,
          rentAtMax: 131_860,
          maxReduction: 61_000_000,
          rentAtMin: 502_270,
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
          depositBase: 50_040_000,
          rentBase: 221_010,
          maxAdditional: 22_000_000,
          rentAtMax: 92_670,
          maxReduction: 41_000_000,
          rentAtMin: 340_590,
        }),
        makeType({
          id: "29",
          name: "29형",
          area: 29.76,
          depositBase: 77_760_000,
          rentBase: 343_440,
          maxAdditional: 35_000_000,
          rentAtMax: 139_270,
          maxReduction: 64_000_000,
          rentAtMin: 530_100,
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
          depositBase: 82_080_000,
          rentBase: 362_520,
          maxAdditional: 37_000_000,
          rentAtMax: 146_680,
          maxReduction: 68_000_000,
          rentAtMin: 560_850,
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
          depositBase: 64_800_000,
          rentBase: 286_200,
          maxAdditional: 29_000_000,
          rentAtMax: 117_030,
          maxReduction: 54_000_000,
          rentAtMin: 443_700,
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
          depositBase: 104_400_000,
          rentBase: 461_100,
          maxAdditional: 47_000_000,
          rentAtMax: 186_930,
          maxReduction: 87_000_000,
          rentAtMin: 714_850,
        }),
        makeType({
          id: "44",
          name: "44형",
          area: 44.83,
          depositBase: 116_800_000,
          rentBase: 515_860,
          maxAdditional: 53_000_000,
          rentAtMax: 206_690,
          maxReduction: 97_000_000,
          rentAtMin: 798_770,
        }),
      ],
    },
  ],
};

export const housingByYear: Record<string, HousingData> = {
  "2026": oryuHousing2026,
  "2025": oryuHousing2025,
};

export const years = Object.keys(housingByYear) as Array<
  keyof typeof housingByYear
>;

export const defaultYear = "2026";

// 현재 페이지에서 사용할 기본 housing 데이터.
export const activeHousing: HousingData = oryuHousing2026;

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

/** 연도 파라미터로부터 실제 housing 데이터를 계산한다. 유효하지 않으면 기본 연도를 사용. */
export function resolveHousingYear(year?: string | null): string {
  if (year && housingByYear[year]) {
    return year;
  }
  return defaultYear;
}
