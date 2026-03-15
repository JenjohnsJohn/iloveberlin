"""Pydantic validation schemas for enriched data per content type."""

from pydantic import BaseModel, Field


class BaseEnrichedData(BaseModel):
    """All enriched data must at least have a title/name."""
    class Config:
        extra = "allow"


class ArticleEnrichedData(BaseEnrichedData):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)


class EventEnrichedData(BaseEnrichedData):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)


class RestaurantEnrichedData(BaseEnrichedData):
    name: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1)
    address: str = Field(min_length=1)


class GuideEnrichedData(BaseEnrichedData):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)


class VideoEnrichedData(BaseEnrichedData):
    title: str = Field(min_length=1, max_length=500)


class CompetitionEnrichedData(BaseEnrichedData):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)


ENRICHED_SCHEMAS: dict[str, type[BaseEnrichedData]] = {
    "article": ArticleEnrichedData,
    "event": EventEnrichedData,
    "restaurant": RestaurantEnrichedData,
    "guide": GuideEnrichedData,
    "video": VideoEnrichedData,
    "competition": CompetitionEnrichedData,
}


def validate_enriched_data(content_type: str, data: dict) -> str | None:
    """Validate enriched data against its schema. Returns error string or None."""
    schema = ENRICHED_SCHEMAS.get(content_type)
    if not schema:
        return None  # No schema defined, allow anything
    try:
        schema.model_validate(data)
        return None
    except Exception as e:
        return str(e)[:500]
