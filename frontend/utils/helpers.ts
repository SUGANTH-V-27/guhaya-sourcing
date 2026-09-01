export function truncateText(text: string, maxLength = 30): string {
  if (!text || text.length <= maxLength) return text || "";
  return text.slice(0, maxLength) + "…";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
