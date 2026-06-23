/** 한국어 조사 — 받침 유무로 갈린다. */

/** 마지막 글자에 받침(종성)이 있으면 true */
function hasBatchim(word: string): boolean {
  const ch = word.trim().charCodeAt(word.trim().length - 1);
  if (Number.isNaN(ch) || ch < 0xac00 || ch > 0xd7a3) return false; // 한글 음절이 아니면 받침 없음 취급
  return (ch - 0xac00) % 28 !== 0;
}

/** 주격 조사 이/가 — "계란이" / "양파가" */
export function subjectParticle(word: string): string {
  return hasBatchim(word) ? '이' : '가';
}

/** 보조사 은/는 — "계란은" / "양파는" */
export function topicParticle(word: string): string {
  return hasBatchim(word) ? '은' : '는';
}

/** 목적격 조사 을/를 — "계란을" / "양파를" */
export function objectParticle(word: string): string {
  return hasBatchim(word) ? '을' : '를';
}

/** 접속 조사 와/과 — "계란과" / "양파와" */
export function withParticle(word: string): string {
  return hasBatchim(word) ? '과' : '와';
}
