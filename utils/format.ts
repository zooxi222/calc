/** 숫자를 천 단위 콤마가 포함된 "원" 표기로 변환한다. 예: 1234567 -> "1,234,567원" */
export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

/** 숫자를 천 단위 콤마만 적용해 반환한다. 예: 1234567 -> "1,234,567" */
export function formatNumber(amount: number): string {
  return Math.round(amount).toLocaleString("ko-KR");
}

/** 백만원 단위 입력값을 "1,200만원" 형태의 한글 단위 표기로 변환한다. 예: 12 -> "1,200만원" */
export function formatManwonFromMillion(million: number): string {
  const manwon = Math.round(million * 100); // 1백만원 = 100만원
  return `${manwon.toLocaleString("ko-KR")}만원`;
}
