import json
import logging
import sys


class JSONFormatter(logging.Formatter):
    """Output structured JSON logs for production."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "method"):
            log_entry["method"] = record.method
        if hasattr(record, "path"):
            log_entry["path"] = record.path
        if hasattr(record, "status"):
            log_entry["status"] = record.status
        if hasattr(record, "duration_ms"):
            log_entry["duration_ms"] = record.duration_ms
        if hasattr(record, "client"):
            log_entry["client"] = record.client
        if record.exc_info and record.exc_info[1]:
            log_entry["error"] = str(record.exc_info[1])
        return json.dumps(log_entry)


def setup_logging(debug: bool = True) -> None:
    """Configure root logging — JSON in prod, human-readable in dev."""
    root = logging.getLogger()
    root.setLevel(logging.DEBUG if debug else logging.INFO)

    # Remove existing handlers
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    if debug:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%H:%M:%S",
        ))
    else:
        handler.setFormatter(JSONFormatter())

    root.addHandler(handler)

    # Quiet noisy libs
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("watchfiles").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
