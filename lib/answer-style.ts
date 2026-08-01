export function answerChoiceStyle(isSelected: boolean, isRight: boolean, hasSelection: boolean): string {
  if (!hasSelection) return "border-border-2 bg-surface text-text-2 hover:border-accent/40 hover:text-text cursor-pointer";
  if (isSelected && isRight) return "border-green-600/50 bg-green-50 text-green-700";
  if (isSelected && !isRight) return "border-red-600/50 bg-red-50 text-red-700";
  if (isRight) return "border-green-600/40 bg-green-50/70 text-green-700/80";
  return "border-border bg-surface text-muted opacity-50";
}
