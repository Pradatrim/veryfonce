// Luhn algorithm — validates a card number is mathematically real.
// Ported from the prototype's luhnCheck().
export function luhnCheck(num: string): boolean {
  if (!num || !/^\d+$/.test(num)) return false;
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num.charAt(i), 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}
