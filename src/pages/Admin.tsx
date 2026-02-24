import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, Lock, DollarSign, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { LoadingModal } from "@/components/LoadingModal";
import { useToast } from "@/hooks/use-toast";
import {
  apiAdminGet,
  apiAdminPatch,
  apiAdminPost,
  apiAdminDelete,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errorUtils";
import type { PricingPlan } from "@/hooks/usePricing";
import type { QuizStep } from "@/hooks/useQuiz";

const ADMIN_KEY_STORAGE = "watchpick_admin_key";
const LOCALES = ["en", "it", "de", "sq", "ru"] as const;

function CreatePlanForm({
  locale,
  onSave,
  onCancel,
}: {
  locale: string;
  onSave: (plan: "pro" | "lifetime", name: string, price: string, period: string, cta: string, badge?: string) => void;
  onCancel: () => void;
}) {
  const [plan, setPlan] = useState<"pro" | "lifetime">("pro");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("");
  const [cta, setCta] = useState("");
  const [badge, setBadge] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(plan, name, price, period, cta, badge || undefined);
  };
  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border space-y-4">
      <h3 className="font-semibold">New plan ({locale})</h3>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Plan type</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value as "pro" | "lifetime")} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm">
          <option value="pro">Pro</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Price</label>
        <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Period</label>
        <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">CTA</label>
        <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Badge (optional)</label>
        <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-muted text-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState("");
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [quizSteps, setQuizSteps] = useState<QuizStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [locale, setLocale] = useState("en");
  const [tab, setTab] = useState<"pricing" | "quiz">("pricing");
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (key) setStoredKey(key);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!storedKey) return;
    const load = async () => {
      setLoading(true);
      try {
        const [pricingRes, quizRes] = await Promise.all([
          apiAdminGet<{ plans: PricingPlan[] }>(`/api/v1/admin/pricing?locale=${locale}`, storedKey),
          apiAdminGet<{ steps: QuizStep[] }>(`/api/v1/admin/quiz?locale=${locale}`, storedKey),
        ]);
        setPlans(pricingRes.plans || []);
        setQuizSteps(quizRes.steps || []);
      } catch {
        toast({ title: t("common.error"), description: "Failed to load", variant: "destructive" });
        setPlans([]);
        setQuizSteps([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storedKey, locale, t, toast]);

  const loadPricing = async () => {
    if (!storedKey) return;
    try {
      const data = await apiAdminGet<{ plans: PricingPlan[] }>(
        `/api/v1/admin/pricing?locale=${locale}`,
        storedKey
      );
      setPlans(data.plans || []);
    } catch {
      toast({ title: t("common.error"), description: "Failed to load pricing", variant: "destructive" });
    }
  };

  const loadQuiz = async () => {
    if (!storedKey) return;
    try {
      const data = await apiAdminGet<{ steps: QuizStep[] }>(
        `/api/v1/admin/quiz?locale=${locale}`,
        storedKey
      );
      setQuizSteps(data.steps || []);
    } catch {
      setQuizSteps([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    setStoredKey(adminKey.trim());
    setAdminKey("");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setStoredKey(null);
    setPlans([]);
    setQuizSteps([]);
  };

  const updateStepContent = async (stepId: string, label: string, minLabel?: string, maxLabel?: string) => {
    if (!storedKey) return;
    setSaving(`step-${stepId}`);
    try {
      await apiAdminPatch(
        `/api/v1/admin/quiz/steps/${stepId}/content?locale=${locale}`,
        storedKey,
        { label, min_label: minLabel, max_label: maxLabel }
      );
      toast({ title: "Saved" });
      loadQuiz();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updateOptionContent = async (optionId: string, text: string) => {
    if (!storedKey) return;
    setSaving(`option-${optionId}`);
    try {
      await apiAdminPatch(
        `/api/v1/admin/quiz/options/${optionId}/content?locale=${locale}`,
        storedKey,
        { text }
      );
      toast({ title: "Saved" });
      loadQuiz();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updatePlan = async (planId: string, field: string, value: string | boolean | number) => {
    if (!storedKey) return;
    setSaving(planId);
    try {
      await apiAdminPatch(`/api/v1/admin/pricing/plans/${planId}?locale=${encodeURIComponent(locale)}`, storedKey, { [field]: value });
      toast({ title: "Saved" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const addFeature = async (planId: string) => {
    if (!storedKey) return;
    setSaving(planId);
    try {
      await apiAdminPost(
        `/api/v1/admin/pricing/plans/${planId}/features`,
        storedKey,
        { text: "New feature", sort_order: 999 }
      );
      toast({ title: "Feature added" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updateFeature = async (featureId: string, text: string) => {
    if (!storedKey) return;
    setSaving(`feature-${featureId}`);
    try {
      await apiAdminPatch(`/api/v1/admin/pricing/features/${featureId}`, storedKey, { text });
      toast({ title: "Saved" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const deleteFeature = async (featureId: string) => {
    if (!storedKey) return;
    setSaving(`feature-${featureId}`);
    try {
      await apiAdminDelete(`/api/v1/admin/pricing/features/${featureId}`, storedKey);
      toast({ title: "Feature removed" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const createPlan = async (plan: "pro" | "lifetime", name: string, price: string, period: string, cta: string, badge?: string) => {
    if (!storedKey) return;
    setSaving("new");
    try {
      await apiAdminPost(
        "/api/v1/admin/pricing/plans",
        storedKey,
        { plan, locale, name, price, period, cta, badge: badge || null, highlighted: false, sort_order: 999 }
      );
      toast({ title: "Plan created" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!storedKey) return;
    if (!confirm("Delete this plan? It will be hidden from users.")) return;
    setSaving(`plan-${planId}`);
    try {
      await apiAdminDelete(`/api/v1/admin/pricing/plans/${planId}`, storedKey);
      toast({ title: "Plan removed" });
      loadPricing();
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (!storedKey) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> {t("common.back")}
          </Link>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-accent" />
              <h1 className="text-xl font-display font-bold">Admin Access</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your admin API key to edit pricing and features.
            </p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Admin API Key"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingModal open={saving !== null} message={t("common.saving")} />
      <div className="min-h-screen bg-background">
        <Navbar
        rightContent={
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        }
      />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t("common.back")}
          </Link>
          <h1 className="text-2xl font-display font-bold">Admin</h1>
        </div>

        <div className="flex gap-2 mb-4">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setTab("pricing")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium ${tab === "pricing" ? "bg-background shadow" : ""}`}
            >
              <DollarSign className="w-4 h-4" /> Pricing
            </button>
            <button
              onClick={() => setTab("quiz")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium ${tab === "quiz" ? "bg-background shadow" : ""}`}
            >
              <HelpCircle className="w-4 h-4" /> Quiz
            </button>
          </div>
        </div>

        {tab === "quiz" ? (
          <div className="space-y-8">
            {quizSteps.map((s) => (
              <div key={s.id} className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="text-lg font-semibold mb-4 capitalize">{s.key}</h2>
                <div className="space-y-2 mb-4">
                  <label className="block text-xs text-muted-foreground">Label</label>
                  <input
                    type="text"
                    defaultValue={s.label}
                    onBlur={(e) => updateStepContent(s.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                  />
                  {s.type === "slider" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-muted-foreground">Min label</label>
                        <input
                          type="text"
                          defaultValue={s.min_label || ""}
                          onBlur={(e) => updateStepContent(s.id, s.label, e.target.value, s.max_label || undefined)}
                          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground">Max label</label>
                        <input
                          type="text"
                          defaultValue={s.max_label || ""}
                          onBlur={(e) => updateStepContent(s.id, s.label, s.min_label || undefined, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-3">Options</h3>
                  <div className="space-y-2">
                    {s.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-32 truncate">{opt.api_value}</span>
                        <input
                          type="text"
                          defaultValue={opt.text}
                          onBlur={(e) => {
                            const v = e.target.value;
                            if (v !== opt.text) updateOptionContent(opt.id, v);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pricing plans</h2>
              <button
                onClick={() => setShowCreatePlan(!showCreatePlan)}
                disabled={saving !== null}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Add plan
              </button>
            </div>
            {showCreatePlan && (
              <CreatePlanForm
                locale={locale}
                onSave={(plan, name, price, period, cta, badge) => {
                  createPlan(plan, name, price, period, cta, badge);
                  setShowCreatePlan(false);
                }}
                onCancel={() => setShowCreatePlan(false)}
              />
            )}
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold capitalize">{plan.plan}</h2>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    aria-label="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid gap-4 mb-6">
                  {[
                    { key: "name", label: "Name", value: plan.name },
                    { key: "price", label: "Price", value: plan.price },
                    { key: "period", label: "Period", value: plan.period },
                    { key: "cta", label: "CTA Button", value: plan.cta },
                    { key: "badge", label: "Badge (optional)", value: plan.badge || "" },
                  ].map(({ key, label, value }) => (
                    <div key={key}>
                      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                      <input
                        type="text"
                        defaultValue={value}
                        onBlur={(e) => {
                          const v = e.target.value;
                          if (v !== value) updatePlan(plan.id, key, v);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`highlighted-${plan.id}`}
                      defaultChecked={plan.highlighted}
                      onChange={(e) => updatePlan(plan.id, "highlighted", e.target.checked)}
                    />
                    <label htmlFor={`highlighted-${plan.id}`} className="text-sm">
                      Highlighted (gold border)
                    </label>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Features</h3>
                    <button
                      onClick={() => addFeature(plan.id)}
                      disabled={saving === plan.id}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {plan.features
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            defaultValue={f.text}
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (v !== f.text) updateFeature(f.id, v);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm"
                          />
                          <button
                            onClick={() => deleteFeature(f.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
