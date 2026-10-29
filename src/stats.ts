// Returns the average of the numbers, or 0 for an empty list.
export function average(numbers: number[]): number {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}
