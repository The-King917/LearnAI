export function answerChoiceStyle(isSelected: boolean, isRight: boolean, hasSelection: boolean): string {
  if (!hasSelection) return "border-border-2 bg-surface text-text-2 hover:border-[#484848] hover:text-text cursor-pointer";
  if (isSelected && isRight) return "border-green-500/60 bg-green-500/10 text-green-400";
  if (isSelected && !isRight) return "border-red-500/50 bg-red-500/10 text-red-400";
  if (isRight) return "border-green-500/40 bg-green-500/[0.06] text-green-500/70";
  return "border-border bg-surface text-[#444] opacity-50";
}
