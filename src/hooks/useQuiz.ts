import { useQuery } from "@tanstack/react-query";
import { apiGetNoAuth } from "@/lib/api";

export interface QuizOption {
  id: string;
  api_value: string;
  text: string;
  sort_order: number;
}

export interface QuizStep {
  id: string;
  key: string;
  type: "slider" | "radio";
  sort_order: number;
  label: string;
  min_label: string | null;
  max_label: string | null;
  options: QuizOption[];
}

// Fallback static steps (from original Quiz.tsx)
const fallbackSteps: QuizStep[] = [
  {
    id: "budget",
    key: "budget",
    type: "slider",
    sort_order: 0,
    label: "quiz.budget.label",
    min_label: "quiz.budget.min",
    max_label: "quiz.budget.max",
    options: [
      { id: "0", api_value: "Under $200", text: "quiz.budget.under200", sort_order: 0 },
      { id: "1", api_value: "$200–$500", text: "quiz.budget.200to500", sort_order: 1 },
      { id: "2", api_value: "$500–$2,000", text: "quiz.budget.500to2000", sort_order: 2 },
      { id: "3", api_value: "$2,000–$5,000", text: "quiz.budget.2000to5000", sort_order: 3 },
      { id: "4", api_value: "$5,000+", text: "quiz.budget.5000plus", sort_order: 4 },
    ],
  },
  {
    id: "occasion",
    key: "occasion",
    type: "radio",
    sort_order: 1,
    label: "quiz.occasion.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "o1", api_value: "Daily Wear", text: "quiz.occasion.daily", sort_order: 0 },
      { id: "o2", api_value: "Business", text: "quiz.occasion.business", sort_order: 1 },
      { id: "o3", api_value: "Sport & Outdoor", text: "quiz.occasion.sport", sort_order: 2 },
      { id: "o4", api_value: "Formal Events", text: "quiz.occasion.formal", sort_order: 3 },
      { id: "o5", api_value: "Gift for Someone", text: "quiz.occasion.gift", sort_order: 4 },
    ],
  },
  {
    id: "style",
    key: "style",
    type: "radio",
    sort_order: 2,
    label: "quiz.style.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "s1", api_value: "Classic & Timeless", text: "quiz.style.classic", sort_order: 0 },
      { id: "s2", api_value: "Modern & Minimal", text: "quiz.style.modern", sort_order: 1 },
      { id: "s3", api_value: "Bold & Statement", text: "quiz.style.bold", sort_order: 2 },
      { id: "s4", api_value: "Luxury & Prestigious", text: "quiz.style.luxury", sort_order: 3 },
    ],
  },
  {
    id: "movementType",
    key: "movementType",
    type: "radio",
    sort_order: 3,
    label: "quiz.movementType.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "m1", api_value: "Automatic", text: "quiz.movementType.automatic", sort_order: 0 },
      { id: "m2", api_value: "Manual Wind", text: "quiz.movementType.manual", sort_order: 1 },
      { id: "m3", api_value: "Quartz", text: "quiz.movementType.quartz", sort_order: 2 },
      { id: "m4", api_value: "No preference", text: "quiz.movementType.noPreference", sort_order: 3 },
    ],
  },
  {
    id: "wristSize",
    key: "wristSize",
    type: "radio",
    sort_order: 4,
    label: "quiz.wristSize.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "w1", api_value: "Small (under 6.5\")", text: "quiz.wristSize.small", sort_order: 0 },
      { id: "w2", api_value: "Medium (6.5\"–7.5\")", text: "quiz.wristSize.medium", sort_order: 1 },
      { id: "w3", api_value: "Large (over 7.5\")", text: "quiz.wristSize.large", sort_order: 2 },
    ],
  },
  {
    id: "gender",
    key: "gender",
    type: "radio",
    sort_order: 5,
    label: "quiz.gender.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "g1", api_value: "Men's", text: "quiz.gender.mens", sort_order: 0 },
      { id: "g2", api_value: "Women's", text: "quiz.gender.womens", sort_order: 1 },
      { id: "g3", api_value: "Unisex", text: "quiz.gender.unisex", sort_order: 2 },
    ],
  },
  {
    id: "brandOpenness",
    key: "brandOpenness",
    type: "radio",
    sort_order: 6,
    label: "quiz.brandOpenness.label",
    min_label: null,
    max_label: null,
    options: [
      { id: "b1", api_value: "Any brand", text: "quiz.brandOpenness.any", sort_order: 0 },
      { id: "b2", api_value: "Luxury only (Rolex, Omega, etc.)", text: "quiz.brandOpenness.luxury", sort_order: 1 },
      { id: "b3", api_value: "Mid-range (Tissot, Seiko, etc.)", text: "quiz.brandOpenness.midRange", sort_order: 2 },
      { id: "b4", api_value: "Budget friendly", text: "quiz.brandOpenness.budget", sort_order: 3 },
      { id: "b5", api_value: "No smartwatches please", text: "quiz.brandOpenness.noSmartwatches", sort_order: 4 },
    ],
  },
];

export function useQuiz(locale: string = "en") {
  const query = useQuery({
    queryKey: ["quiz", locale],
    queryFn: async () => {
      const data = await apiGetNoAuth<{ steps: QuizStep[] }>(
        `/api/v1/quiz?locale=${encodeURIComponent(locale)}`
      );
      return data.steps;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const steps = query.data && query.data.length > 0 ? query.data : fallbackSteps;
  const isFromApi = !!query.data?.length;

  return { ...query, steps, isFromApi };
}
