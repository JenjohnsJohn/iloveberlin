import bleach

ALLOWED_TAGS = [
    "p", "br", "strong", "em", "b", "i", "u",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre",
    "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr", "span", "div",
]

ALLOWED_ATTRS = {
    "a": ["href", "title", "target", "rel"],
    "img": ["src", "alt", "width", "height"],
    "span": ["class"],
    "div": ["class"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
}


def sanitize_html(html: str) -> str:
    """Sanitize HTML content, keeping only safe tags and attributes."""
    if not html:
        return ""
    return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)


def strip_html(html: str) -> str:
    """Remove all HTML tags, returning plain text."""
    if not html:
        return ""
    return bleach.clean(html, tags=[], strip=True).strip()
