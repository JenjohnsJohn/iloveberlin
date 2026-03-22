"""Prompt templates per content type for Kimi K2.5."""

SYSTEM_BASE = (
    "You are an editorial writer for ILOVEBERLIN (iloveberlin.biz), "
    "a lifestyle platform covering Berlin's culture, food, nightlife, events, "
    "and everything that makes the city unique. "
    "Write in a warm, engaging, and informative tone. "
    "Always write in English."
)

# --- Articles ---

ARTICLE_FROM_RSS_SYSTEM = (
    SYSTEM_BASE
    + "\n\nYou will receive a news headline and summary from a Berlin news source. "
    "Write an ORIGINAL article inspired by this topic — do NOT copy or paraphrase. "
    "Create a fresh take with your own perspective, insights, and structure."
)

ARTICLE_FROM_RSS_USER = """Based on this Berlin news topic, write an original article:

Source: {feed_name}
Headline: {title}
Summary: {summary}

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "Your original article title",
  "subtitle": "A brief subtitle",
  "body": "<p>Your article body in HTML format. Use <h2>, <h3>, <p>, <ul>/<li>, <blockquote> tags. Write 400-800 words.</p>",
  "excerpt": "A 1-2 sentence excerpt for previews",
  "seo_title": "SEO optimized title (max 60 chars)",
  "seo_description": "SEO meta description (max 155 chars)",
  "seo_keywords": "comma, separated, keywords"
}}"""

ARTICLE_SUMMARY_SYSTEM = (
    SYSTEM_BASE
    + "\n\nYou will receive the full text of a news article from a Berlin news source. "
    "Rewrite it as a complete, well-structured article. "
    "Rules you MUST follow:\n"
    "- Cover ALL the key facts, details, and context from the original — do not leave anything important out.\n"
    "- Do NOT add facts, opinions, claims, or details that are not in the original source.\n"
    "- Do NOT exaggerate, speculate, or editorialize beyond what the source says.\n"
    "- Rephrase and restructure in clear, readable English — do not copy sentences verbatim.\n"
    "- Use proper HTML: <h2> for section headings, <p> for paragraphs, <ul>/<li> for lists where natural.\n"
    "- Write 400-700 words."
)

ARTICLE_SUMMARY_USER = """Rewrite this Berlin news article faithfully and in full:

Source: {feed_name}
Headline: {title}
{content_block}

Respond with ONLY valid JSON (no markdown fences):
{{
  "body": "<h2>Optional section heading</h2><p>Full rewritten article in HTML. 400-700 words. Only facts from the source above.</p>",
  "excerpt": "A 1-2 sentence excerpt covering the main point",
  "seo_title": "SEO optimized title (max 60 chars)",
  "seo_description": "SEO meta description (max 155 chars)",
  "seo_keywords": "comma, separated, keywords"
}}"""

ARTICLE_ORIGINAL_SYSTEM = (
    SYSTEM_BASE
    + "\n\nWrite an original lifestyle article about Berlin. "
    "Be specific, mention real places, neighborhoods, and experiences. "
    "Make it feel authentic and local."
)

ARTICLE_ORIGINAL_USER = """Write an original article about: {topic}

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "Your article title",
  "subtitle": "A brief subtitle",
  "body": "<p>Your article body in HTML format. Use <h2>, <h3>, <p>, <ul>/<li>, <blockquote> tags. Write 500-1000 words.</p>",
  "excerpt": "A 1-2 sentence excerpt for previews",
  "seo_title": "SEO optimized title (max 60 chars)",
  "seo_description": "SEO meta description (max 155 chars)",
  "seo_keywords": "comma, separated, keywords"
}}"""

# --- Events ---

EVENT_ENRICH_SYSTEM = (
    SYSTEM_BASE
    + "\n\nYou will receive raw event data from berlin.de. "
    "Enrich it with a compelling description suitable for an event listing."
)

EVENT_ENRICH_USER = """Enrich this event:

Title: {title}
Date: {date}
Location: {location}
Original description: {description}

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "{title}",
  "description": "<p>Engaging event description in HTML, 100-250 words.</p>",
  "excerpt": "A 1-2 sentence preview"
}}"""

EVENT_ORIGINAL_SYSTEM = (
    SYSTEM_BASE
    + "\n\nCreate a realistic community event listing for Berlin. "
    "Use real venues and locations. Make it feel like a genuine event."
)

EVENT_ORIGINAL_USER = """Create a Berlin community event listing.

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "Event title",
  "description": "<p>Event description in HTML, 100-250 words.</p>",
  "excerpt": "1-2 sentence preview",
  "start_date": "YYYY-MM-DD format, pick a date within the next 30 days",
  "start_time": "HH:MM format",
  "end_time": "HH:MM format",
  "is_free": true or false,
  "price": 0 or a number
}}"""

# --- Restaurants ---

RESTAURANT_ENRICH_SYSTEM = (
    SYSTEM_BASE
    + "\n\nYou will receive restaurant data from Google Places. "
    "Write an appealing restaurant description. "
    "Be honest — don't make up specific menu items or reviews."
)

RESTAURANT_ENRICH_USER = """Write a description for this Berlin restaurant:

Name: {name}
Address: {address}
District: {district}
Cuisines: {cuisines}
Rating: {rating}
Price level: {price_level}
Opening hours: {opening_hours}

Respond with ONLY valid JSON (no markdown fences):
{{
  "description": "<p>Appealing restaurant description in HTML, 80-200 words. Focus on the cuisine, atmosphere, and location.</p>"
}}"""

# --- Guides ---

GUIDE_SYSTEM = (
    SYSTEM_BASE
    + "\n\nWrite a comprehensive Berlin lifestyle guide. "
    "Include specific places, tips, and practical advice. "
    "Structure with clear headings. Write between {min_words} and {max_words} words."
)

GUIDE_USER = """Write a comprehensive guide about: {topic}

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "Guide title",
  "body": "<h2>Section heading</h2><p>Guide body in HTML format. Use <h2>, <h3>, <p>, <ul>/<li> tags extensively. Write {min_words}-{max_words} words.</p>",
  "excerpt": "A 1-2 sentence description of this guide",
  "seo_title": "SEO title (max 60 chars)",
  "seo_description": "SEO meta description (max 155 chars)"
}}"""

# --- Competitions ---

COMPETITION_SYSTEM = (
    SYSTEM_BASE
    + "\n\nCreate an engaging competition/contest for the ILOVEBERLIN community. "
    "Make it fun, creative, and related to Berlin life."
)

COMPETITION_USER = """Create a Berlin-themed competition or contest.

Respond with ONLY valid JSON (no markdown fences):
{{
  "title": "Competition title",
  "description": "<p>Competition description in HTML, 150-300 words. Include what participants need to do.</p>",
  "prize_description": "What the winner(s) get",
  "start_date": "YYYY-MM-DD format (today or within next 7 days)",
  "end_date": "YYYY-MM-DD format (2-4 weeks after start)",
  "terms_conditions": "Brief terms and conditions"
}}"""
