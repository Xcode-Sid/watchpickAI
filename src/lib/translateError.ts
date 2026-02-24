import type { TFunction } from "i18next";

/**
 * Maps backend/API error messages to translated strings.
 * Ensures all user-facing errors are shown in the user's language.
 */
export function translateError(message: string | undefined, t: TFunction): string {
  const msg = (message || "").toLowerCase();

  if (msg.includes("email is not activated") || msg.includes("not activated")) {
    return t("auth.emailNotActivated");
  }
  if (msg.includes("invalid email") || msg.includes("invalid password") || msg.includes("invalid credentials")) {
    return t("errors.invalidCredentials");
  }
  if (msg.includes("request failed")) {
    return t("errors.requestFailed");
  }
  if (msg.includes("no picks received")) {
    return t("errors.noPicksReceived");
  }
  if (msg.includes("failed to generate") || msg.includes("no picks generated")) {
    return t("errors.failedToGenerate");
  }
  if (msg.includes("no billing account") || msg.includes("subscribe to a plan")) {
    return t("errors.noBillingAccount");
  }
  if (msg.includes("checkout") || msg.includes("stripe")) {
    return t("errors.checkoutFailed");
  }
  if (msg.includes("portal") || msg.includes("billing")) {
    return t("errors.managePlanFailed");
  }

  return t("errors.generic");
}
