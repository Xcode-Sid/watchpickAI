/**
 * Currency conversion and formatting per locale.
 * Base: USD. Rates: EUR 0.90, ALL 82 ($4.9≈401 L), RUB 90
 */
const RATES: Record<string, number> = {
  en: 1,
  it: 0.9,
  de: 0.9,
  sq: 82,
  ru: 90,
};

export function formatPrice(usdAmount: number, locale: string): string {
  const rate = RATES[locale] ?? RATES.en;
  const amount = Math.round(usdAmount * rate);

  switch (locale) {
    case "it":
    case "de":
      return `${amount.toLocaleString(locale === "it" ? "it-IT" : "de-DE")} €`;
    case "sq":
      return `${amount.toLocaleString("sq-AL")} L`;
    case "ru":
      return `${amount.toLocaleString("ru-RU")} ₽`;
    default:
      return `$${amount.toLocaleString("en-US")}`;
  }
}

