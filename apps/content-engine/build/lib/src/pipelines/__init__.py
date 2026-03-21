"""Pipeline registry."""

from src.api_client.client import APIClient
from src.pipelines.articles import ArticleAIPipeline, ArticleRSSPipeline
from src.pipelines.base import BasePipeline
from src.pipelines.competitions import CompetitionPipeline
from src.pipelines.events import EventAIPipeline, EventBerlinDePipeline
from src.pipelines.guides import GuidePipeline
from src.pipelines.restaurants import RestaurantPipeline
from src.pipelines.videos import VideoPipeline

# Map content_type → default pipeline class (for retry)
_PIPELINE_MAP: dict[str, type[BasePipeline]] = {
    "article": ArticleRSSPipeline,
    "event": EventBerlinDePipeline,
    "restaurant": RestaurantPipeline,
    "guide": GuidePipeline,
    "video": VideoPipeline,
    "competition": CompetitionPipeline,
}


def get_pipeline(content_type: str, api_client: APIClient) -> BasePipeline | None:
    cls = _PIPELINE_MAP.get(content_type)
    if cls:
        return cls(api_client)
    return None
