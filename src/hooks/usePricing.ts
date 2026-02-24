import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiGetNoAuth } from "@/lib/api";
import { pricingTiers } from "@/data/pricing";
import { useBackendHealth } from "@/hooks/useBackendHealth";

export interface PricingFeature {
  id: string;
  text: string;
  sort_order: number;
}

export interface PricingPlan {
  id: string;
  plan: "pro" | "lifetime";
  name: string;
  price: string;
  period: string;
  cta: string;
  badge: string | null;
  highlighted: boolean;
  sort_order: number;
  features: PricingFeature[];
}

export function usePricing(locale: string = "en") {
  const { t } = useTranslation();
  const { isOnline } = useBackendHealth();
  const query = useQuery({
    queryKey: ["pricing", locale],
    queryFn: async () => {
      const data = await apiGetNoAuth<{ plans: PricingPlan[] }>(
        `/api/v1/pricing?locale=${encodeURIComponent(locale)}`
      );
      return data.plans;
    },
    // Don't spam the API when we already know the server is offline
    enabled: isOnline,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });

  const apiPlans = query.data ?? [];

  // When we are ONLINE but have no API data (e.g. fresh project, empty table),
  // we still fall back to static, translated tiers.
  // When we are OFFLINE, we do NOT show static prices/features.
  const shouldUseStatic = apiPlans.length === 0 && isOnline;

  const plans: PricingPlan[] = shouldUseStatic
    ? pricingTiers.map((tier, idx) => ({
        id: tier.plan,
        plan: tier.plan,
        name: tier.nameKey,
        price: t(`pricing.${tier.plan}.price`),
        period: tier.periodKey,
        cta: tier.ctaKey,
        badge: tier.badgeKey ?? null,
        highlighted: tier.highlighted,
        sort_order: idx,
        features: tier.featureKeys.map((key, i) => ({
          id: `${tier.plan}-${i}`,
          text: key,
          sort_order: i,
        })),
      }))
    : apiPlans;

  return { ...query, plans, isFromApi: !!apiPlans.length, isOffline: !isOnline };
}
