from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RawItem:
    """A raw item fetched from an external source."""

    source_type: str
    source_id: str
    content_type: str
    data: dict
    image_url: str | None = None


class Source(ABC):
    """Abstract base class for content sources."""

    source_type: str

    @abstractmethod
    async def fetch(self) -> list[RawItem]:
        """Fetch items from the source. Returns a list of RawItems."""
        ...
