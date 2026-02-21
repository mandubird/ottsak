/**
 * Fuzzy Matching - 영상 제목과 작품명 매칭
 */

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1.0
  return (maxLen - levenshtein(a, b)) / maxLen
}

export interface MatchResult {
  score: number
  method: 'exact_include' | 'word_match' | 'fuzzy'
  matched_words?: string[]
}

export function matchWorkTitle(
  videoTitle: string,
  workTitle: string
): MatchResult {
  const vt = videoTitle.toLowerCase().trim()
  const wt = workTitle.toLowerCase().trim()

  if (vt.includes(wt)) return { score: 1.0, method: 'exact_include' }

  const workWords = wt
    .split(/[\s\-:()\[\]/]+/)
    .filter((w) => w.length > 1)
  const matchedWords = workWords.filter((w) => vt.includes(w))
  const wordScore =
    workWords.length > 0 ? matchedWords.length / workWords.length : 0

  if (wordScore >= 0.8)
    return { score: wordScore, method: 'word_match', matched_words: matchedWords }

  const levScore = stringSimilarity(vt, wt)
  const finalScore = Math.round((wordScore * 0.7 + levScore * 0.3) * 100) / 100
  return { score: finalScore, method: 'fuzzy', matched_words: matchedWords }
}
