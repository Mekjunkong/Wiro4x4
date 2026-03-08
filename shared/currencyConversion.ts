/**
 * Currency Conversion Utility
 *
 * Provides conversion from Thai Baht (THB) to major foreign currencies
 * for display in tooltips and pricing estimates.
 *
 * Last updated: 2026-03-08
 */

/**
 * Static exchange rates from THB to major currencies
 * Last updated: 2026-03-08
 */
export const EXCHANGE_RATES = {
  USD: 0.028, // US Dollar
  EUR: 0.026, // Euro
  ILS: 0.1, // Israeli Shekel
} as const;

/**
 * Supported currency codes
 */
export type SupportedCurrency = keyof typeof EXCHANGE_RATES;

/**
 * Currency symbols for display
 */
const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  EUR: "€",
  ILS: "₪",
};

/**
 * Converts THB amount to the specified currency and formats it
 *
 * @param thb - Amount in Thai Baht
 * @param currency - Target currency code (USD, EUR, ILS)
 * @returns Formatted currency string (e.g., "$28", "€26", "₪100")
 *
 * @example
 * formatCurrency(1000, 'USD') // Returns "$28"
 * formatCurrency(5000, 'EUR') // Returns "€130"
 */
export function formatCurrency(
  thb: number,
  currency: SupportedCurrency
): string {
  const rate = EXCHANGE_RATES[currency];
  const converted = Math.round(thb * rate);
  const symbol = CURRENCY_SYMBOLS[currency];

  return `${symbol}${converted}`;
}

/**
 * Converts THB amount to all supported currencies and returns a tooltip string
 *
 * @param thb - Amount in Thai Baht
 * @returns Formatted multi-currency string (e.g., "~$28 USD | ~€26 EUR | ~₪100 ILS")
 *
 * @example
 * formatMultiCurrency(1000) // Returns "~$28 USD | ~€26 EUR | ~₪100 ILS"
 */
export function formatMultiCurrency(thb: number): string {
  const usd = formatCurrency(thb, "USD");
  const eur = formatCurrency(thb, "EUR");
  const ils = formatCurrency(thb, "ILS");

  return `~${usd} USD | ~${eur} EUR | ~${ils} ILS`;
}
