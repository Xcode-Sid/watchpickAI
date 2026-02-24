export interface PricingTier {
  plan: "pro" | "lifetime";
  nameKey: string;
  price: string;
  periodKey: string;
  featureKeys: string[];
  ctaKey: string;
  highlighted: boolean;
  badgeKey?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    plan: "pro",
    nameKey: "pricing.pro.name",
    price: "$4.99",
    periodKey: "pricing.pro.period",
    featureKeys: [
      "pricing.pro.feature1",
      "pricing.pro.feature2",
      "pricing.pro.feature3",
      "pricing.pro.feature4",
    ],
    ctaKey: "pricing.pro.cta",
    highlighted: true,
    badgeKey: "pricing.pro.badge",
  },
  {
    plan: "lifetime",
    nameKey: "pricing.lifetime.name",
    price: "$19",
    periodKey: "pricing.lifetime.period",
    featureKeys: [
      "pricing.lifetime.feature1",
      "pricing.lifetime.feature2",
      "pricing.lifetime.feature3",
    ],
    ctaKey: "pricing.lifetime.cta",
    highlighted: false,
  },
];
