"""Tests for Kling AI image generator: prompt building and watermarking."""

from src.ai.image_generator import add_watermark, build_image_prompt


class TestBuildImagePrompt:
    def test_article_prompt(self):
        prompt = build_image_prompt("article", {"title": "Best Cafés in Kreuzberg"})
        assert "Best Cafés in Kreuzberg" in prompt
        assert "Berlin" in prompt
        assert "Editorial" in prompt

    def test_guide_prompt(self):
        prompt = build_image_prompt("guide", {"title": "Nightlife Guide"})
        assert "Nightlife Guide" in prompt
        assert "wide-angle" in prompt.lower()

    def test_event_prompt(self):
        prompt = build_image_prompt("event", {"title": "Berlin Tech Meetup"})
        assert "Berlin Tech Meetup" in prompt
        assert "vibrant" in prompt.lower() or "event" in prompt.lower()

    def test_restaurant_prompt_with_details(self):
        enriched = {
            "name": "Mustafa's Gemüse Kebap",
            "district": "Kreuzberg",
            "cuisines": ["Turkish", "Street Food"],
        }
        prompt = build_image_prompt("restaurant", enriched)
        assert "Mustafa's Gemüse Kebap" in prompt
        assert "Kreuzberg" in prompt
        assert "Turkish" in prompt

    def test_restaurant_prompt_minimal(self):
        prompt = build_image_prompt("restaurant", {"name": "Test Place"})
        assert "Test Place" in prompt
        assert "restaurant" in prompt.lower()

    def test_competition_prompt(self):
        prompt = build_image_prompt("competition", {"title": "Win Concert Tickets"})
        assert "Win Concert Tickets" in prompt
        assert "contest" in prompt.lower() or "promotional" in prompt.lower()

    def test_unknown_type_falls_back_to_article(self):
        prompt = build_image_prompt("unknown_type", {"title": "Something"})
        assert "Something" in prompt
        assert "Berlin" in prompt

    def test_missing_title_uses_fallback(self):
        prompt = build_image_prompt("article", {})
        assert "Berlin" in prompt

    def test_no_text_overlays_in_prompt(self):
        for ct in ["article", "guide", "event", "restaurant", "competition"]:
            prompt = build_image_prompt(ct, {"title": "Test", "name": "Test"})
            assert "No text overlays" in prompt


class TestAddWatermark:
    def _make_test_image(self, width=800, height=450) -> bytes:
        """Create a simple test image as bytes."""
        import io
        from PIL import Image

        img = Image.new("RGB", (width, height), color=(100, 150, 200))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    def test_returns_jpeg_bytes(self):
        original = self._make_test_image()
        result = add_watermark(original)
        assert isinstance(result, bytes)
        assert len(result) > 0
        # Verify it's valid JPEG (starts with FF D8)
        assert result[:2] == b"\xff\xd8"

    def test_watermark_does_not_crash_on_small_image(self):
        original = self._make_test_image(width=50, height=30)
        result = add_watermark(original)
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_watermark_does_not_crash_on_large_image(self):
        original = self._make_test_image(width=3840, height=2160)
        result = add_watermark(original)
        assert isinstance(result, bytes)
        assert len(result) > 0
