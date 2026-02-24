from __future__ import annotations

import logging

import resend

from app.core.config import settings

logger = logging.getLogger("watchpick.email")


def _send(to: str, subject: str, html: str) -> None:
    """Send an email via Resend. Silently fails if not configured."""
    if not settings.resend_configured:
        logger.debug("Email skipped (Resend not configured): %s -> %s", subject, to)
        return

    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info("Email sent: %s -> %s", subject, to)
    except Exception:
        logger.exception("Failed to send email to %s", to)


def send_welcome_email(email: str) -> None:
    _send(
        to=email,
        subject="Welcome to WatchPick!",
        html=(
            "<h2>Welcome to WatchPick!</h2>"
            "<p>Your account is ready. Take the quiz to get your first AI-curated watch picks.</p>"
            f'<p><a href="{settings.frontend_url}/quiz">Take the Quiz →</a></p>'
            "<p>— The WatchPick Team</p>"
        ),
    )


def send_payment_confirmation(email: str, plan: str) -> None:
    plan_label = "Pro (monthly)" if plan == "pro" else "Lifetime"
    _send(
        to=email,
        subject=f"WatchPick {plan_label} — Payment Confirmed",
        html=(
            f"<h2>You're now on {plan_label}!</h2>"
            "<p>Thanks for upgrading. You now have access to:</p>"
            "<ul>"
            "<li>All 3 watch picks + Hidden Gem</li>"
            "<li>Full pick history</li>"
            "<li>Unlimited quiz retakes</li>"
            "</ul>"
            f'<p><a href="{settings.frontend_url}/quiz">Take the Quiz →</a></p>'
            "<p>— The WatchPick Team</p>"
        ),
    )
