import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Crown, Clock, ExternalLink, Watch, Calendar, Hash, ArrowRight, ArrowLeft, Copy, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { apiPost } from "@/lib/api";
import { translateError } from "@/lib/translateError";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { AccountSkeleton } from "@/components/AccountSkeleton";
import { LoadingModal } from "@/components/LoadingModal";
import {
  staggerContainer,
  fadeInUp,
  popIn,
  hoverLift,
  pageTransition,
} from "@/lib/animations";
import { getErrorMessage } from "@/lib/errorUtils";
import type { WatchPick } from "@/types/watch";

const Account = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [picks, setPicks] = useState<WatchPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [expandedPick, setExpandedPick] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");

  const [emailNotActivated, setEmailNotActivated] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const emailConfirmedAt = "email_confirmed_at" in user ? (user as { email_confirmed_at?: string | null }).email_confirmed_at : null;
      if (!emailConfirmedAt) {
        setEmailNotActivated(true);
        setLoading(false);
        return;
      }

      setEmail(user.email || "");
      setCreatedAt(user.created_at || "");

      const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("user_id", user.id).single();
      if (profile) setSubscriptionStatus(profile.subscription_status);

      const isPro = profile?.subscription_status === "pro" || profile?.subscription_status === "lifetime";
      if (isPro) {
        const { data: recs } = await supabase
          .from("picks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (recs) setPicks(recs as unknown as WatchPick[]);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("account.loggedOut") });
    navigate("/");
  };

  const handleShare = (pick: WatchPick) => {
    const watches = pick.results?.slice(0, 3) || [];
    const text = `My WatchPick results:\n${watches.map((w) => `- ${w.brand} ${w.name} (${w.price_range})`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast({ title: t("account.copied"), description: t("account.copiedDesc") });
  };

  const isPro = subscriptionStatus === "pro" || subscriptionStatus === "lifetime";
  const memberSince = createdAt ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";

  if (loading) {
    return <AccountSkeleton />;
  }

  if (emailNotActivated) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Navbar
          rightContent={
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" /> {t("account.logout")}
            </button>
          }
        />
        <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors mb-6" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <p className="font-display font-semibold text-lg mb-2">{t("account.emailNotActivated")}</p>
            <p className="text-muted-foreground text-sm mb-6">{t("account.emailNotActivatedDesc")}</p>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
            >
              {t("account.logout")}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <LoadingModal open={loadingPortal} message={t("account.openingPortal")} />
      <motion.div
        className="min-h-screen bg-background"
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Navbar
        rightContent={
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> {t("account.logout")}
          </button>
        }
      />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <motion.div className="mb-6" variants={fadeInUp} initial="hidden" animate="show">
          <Link to="/" className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.h1 className="text-3xl font-display font-bold mb-2" variants={fadeInUp}>
            {t("account.welcomeBack")}
          </motion.h1>
          <motion.p className="text-muted-foreground mb-8" variants={fadeInUp}>
            {email}
          </motion.p>

          {/* Stats Cards */}
          <motion.div className="grid grid-cols-3 gap-4 mb-8" variants={staggerContainer} initial="hidden" animate="show">
            <motion.div className="p-5 rounded-2xl bg-card border border-border text-center" variants={popIn} whileHover={hoverLift}>
              <Hash className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{picks.length}</p>
              <p className="text-xs text-muted-foreground">{t("account.totalPicks")}</p>
            </motion.div>
            <motion.div className="p-5 rounded-2xl bg-card border border-border text-center" variants={popIn} whileHover={hoverLift}>
              <Calendar className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{memberSince}</p>
              <p className="text-xs text-muted-foreground">{t("account.memberSince")}</p>
            </motion.div>
            <motion.div className="p-5 rounded-2xl bg-card border border-border text-center" variants={popIn} whileHover={hoverLift}>
              <Crown className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold capitalize">{subscriptionStatus}</p>
              <p className="text-xs text-muted-foreground">{t("account.currentPlan")}</p>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div className="flex gap-3 mb-8" variants={fadeInUp}>
            <Link
              to="/quiz"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Watch className="w-4 h-4" /> {t("account.takeQuiz")}
            </Link>
            {!isPro && (
              <Link
                to="/pricing"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Crown className="w-4 h-4" /> {t("account.upgradeToPro")}
              </Link>
            )}
            {isPro && (
              <button
                onClick={async () => {
                  setLoadingPortal(true);
                  try {
                    const { url } = await apiPost<{ url: string }>("/api/v1/payments/portal");
                    window.location.href = url;
                  } catch (e: unknown) {
                    setLoadingPortal(false);
                    toast({ title: t("common.error"), description: translateError(getErrorMessage(e), t), variant: "destructive" });
                  }
                }}
                disabled={loadingPortal}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                <ExternalLink className="w-4 h-4" /> {t("account.managePlan")}
              </button>
            )}
          </motion.div>

          {/* Pick History */}
          <motion.h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2" variants={fadeInUp}>
            <Clock className="w-5 h-5" /> {t("account.pickHistory")}
          </motion.h2>

          {!isPro ? (
            <motion.div className="p-8 rounded-2xl bg-card border border-border text-center" variants={fadeInUp}>
              <Crown className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="font-semibold mb-1">{t("account.unlockHistory")}</p>
              <p className="text-muted-foreground text-sm mb-4">{t("account.unlockHistoryDesc")}</p>
              <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                {t("account.viewPlans")} <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : picks.length === 0 ? (
            <motion.div className="p-8 rounded-2xl bg-card border border-border text-center" variants={fadeInUp}>
              <Watch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold mb-1">{t("account.noPicksYet")}</p>
              <p className="text-muted-foreground text-sm mb-4">{t("account.noPicksDesc")}</p>
              <Link to="/quiz" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                {t("account.startQuiz")} <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (
            <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="show">
              {picks.map((pick) => {
                const isExpanded = expandedPick === pick.id;
                const watches = pick.results || [];

                return (
                  <motion.div
                    key={pick.id}
                    className="rounded-2xl bg-card border border-border overflow-hidden"
                    variants={fadeInUp}
                  >
                    <button
                      onClick={() => setExpandedPick(isExpanded ? null : pick.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-medium">
                            {new Date(pick.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                            {pick.quiz_inputs?.budget}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {watches.slice(0, 3).map((w, i) => (
                            <span key={i} className="text-xs text-muted-foreground">{w.brand} {w.name?.split(" ").slice(-1)}{i < 2 ? " ·" : ""}</span>
                          ))}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            {watches.map((w, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <Watch className="w-5 h-5 text-muted-foreground/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-accent font-medium">{w.brand}</p>
                                  <p className="text-sm font-semibold truncate">{w.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <span>{w.price_range}</span>
                                    <span>·</span>
                                    <span>{w.case_size}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{w.reason}</p>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => handleShare(pick)}
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> {t("account.copyResults")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default Account;
