export const parseLines = (s: string): string[] => {
  return (s || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
}
