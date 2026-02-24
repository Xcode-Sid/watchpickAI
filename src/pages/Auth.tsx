import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Watch, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { apiPostNoAuth } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorUtils";
import { translateError } from "@/lib/translateError";
import { LoadingModal } from "@/components/LoadingModal";
import { scaleIn, fadeInUp, staggerContainer, tapScale, pageTransition } from "@/lib/animations";
import type { Provider } from "@supabase/supabase-js";

const oauthProviders: { id: Provider; label: string; icon: JSX.Element; bg: string }[] = [
  {
    id: "google",
    label: "Google",
    bg: "bg-white text-gray-800 hover:bg-gray-100 dark:bg-white dark:text-gray-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    bg: "bg-white text-gray-800 hover:bg-gray-100 dark:bg-white dark:text-gray-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    bg: "bg-[#24292F] text-white hover:bg-[#3b434b]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "discord",
    label: "Discord",
    bg: "bg-[#5865F2] text-white hover:bg-[#4752c4]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    bg: "bg-black text-white hover:bg-gray-900",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    bg: "bg-[#1877F2] text-white hover:bg-[#166FE5]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "azure",
    label: "Microsoft",
    bg: "bg-white text-gray-800 hover:bg-gray-100 dark:bg-white dark:text-gray-800",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  {
    id: "linkedin_oidc",
    label: "LinkedIn",
    bg: "bg-[#0A66C2] text-white hover:bg-[#004182]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "spotify",
    label: "Spotify",
    bg: "bg-[#1DB954] text-white hover:bg-[#1aa34a]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
];

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      toast({ title: t("auth.validation.emailRequired"), description: t("auth.validation.emailMessage"), variant: "destructive" });
      return;
    }
    if (!trimmedPassword) {
      toast({ title: t("auth.validation.passwordRequired"), description: t("auth.validation.passwordMessage"), variant: "destructive" });
      return;
    }
    if (trimmedPassword.length < 6) {
      toast({ title: t("auth.validation.passwordShort"), description: t("auth.validation.passwordShortMessage"), variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await apiPostNoAuth<{
          access_token: string;
          refresh_token: string;
          expires_at: number;
          user: { id: string; email: string };
        }>("/api/v1/auth/signin", { email: trimmedEmail, password: trimmedPassword });
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        toast({ title: t("auth.toast.welcomeBack") });
        navigate(redirectTo);
      } else {
        const data = await apiPostNoAuth<{
          message?: string;
          access_token?: string;
          refresh_token?: string;
        }>("/api/v1/auth/signup", { email: trimmedEmail, password: trimmedPassword });
        if (data.access_token && data.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          toast({ title: t("auth.toast.accountCreated") });
          navigate(redirectTo);
        } else {
          toast({ title: t("auth.toast.checkEmail"), description: data.message || t("auth.toast.checkEmailDesc") });
        }
      }
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      if (msg.toLowerCase().includes("email is not activated") || msg.toLowerCase().includes("not activated")) {
        toast({ title: t("auth.emailNotActivated"), description: t("auth.emailNotActivatedDesc"), variant: "destructive" });
      } else {
        toast({ title: t("common.error"), description: translateError(msg, t), variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: Provider) => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${redirectTo}` },
      });
      if (error) throw error;
    } catch (e: unknown) {
      toast({ title: t("common.error"), description: translateError(getErrorMessage(e), t), variant: "destructive" });
      setOauthLoading(null);
    }
  };

  return (
    <>
      <LoadingModal open={loading} message={isLogin ? t("auth.signingIn") : t("auth.creatingAccount")} />
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="w-full max-w-sm"
        variants={scaleIn}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Watch className="w-6 h-6 text-accent" />
            <span className="font-display font-bold text-xl">{t("common.brand")}</span>
          </Link>
        </div>

        <motion.div
          className="p-6 rounded-2xl bg-card border border-border"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
        >
          <h2 className="font-display font-semibold text-xl text-center mb-6">
            {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h2>

          {/* OAuth Providers */}
          <motion.div
            className="space-y-2 mb-5"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {oauthProviders.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => handleOAuth(p.id)}
                disabled={oauthLoading !== null}
                variants={fadeInUp}
                whileTap={tapScale}
                className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border border-border/50 disabled:opacity-50 ${p.bg}`}
              >
                {oauthLoading === p.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  p.icon
                )}
                {t("auth.continueWith", { provider: p.label })}
              </motion.button>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{t("common.or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder={t("auth.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/80"
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={tapScale}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLogin ? t("auth.signIn") : t("auth.signUp")}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? t("auth.signUpShort") : t("auth.signInShort")}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
    </>
  );
};

export default Auth;
