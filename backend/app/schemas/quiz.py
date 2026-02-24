from pydantic import BaseModel


class QuizStepContentUpdate(BaseModel):
    label: str | None = None
    min_label: str | None = None
    max_label: str | None = None
    name_translations: dict | None = None


class QuizOptionContentUpdate(BaseModel):
    text: str | None = None
    name_translations: dict[str, str] | None = None
