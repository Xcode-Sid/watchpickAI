export interface WatchResult {
  brand: string;
  name: string;
  price_range: string;
  case_size?: string;
  reason?: string;
}

export interface QuizInputs {
  budget?: string;
  occasion?: string;
  style?: string;
  wristSize?: string;
  gender?: string;
  brandOpenness?: string;
  movementType?: string;
}

export interface WatchPick {
  id: string;
  quiz_inputs: QuizInputs;
  results: WatchResult[];
  created_at: string;
}
