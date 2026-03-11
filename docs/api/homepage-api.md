# Homepage API

**Base URL:** `https://iloveberlin.biz/api/v1`

**Last Updated:** 2026-03-12

---

## Overview

The Homepage API serves aggregated content for the ILoveBerlin homepage, delivering a curated mix of hero content, trending articles, upcoming events, weekend picks, dining highlights, featured videos, active competitions, and latest classifieds in a single efficient request. Admins can curate homepage sections, control content ordering, and set featured items. The homepage payload is cached and optimized for fast initial page loads.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/homepage` | public | Get aggregated homepage data |
| `GET` | `/admin/homepage/sections` | admin | List homepage sections and configuration |
| `PATCH` | `/admin/homepage/sections/:sectionId` | admin | Update a homepage section |
| `PUT` | `/admin/homepage/featured` | admin | Set featured items |

---

## Public Endpoints

### Get Homepage Data

```
GET /api/v1/homepage
```

Returns all homepage sections in a single aggregated response. This endpoint is heavily cached (60-second TTL) for performance. The response includes all content sections needed to render the homepage without additional API calls.

**Authentication:** None (public)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lang` | string | `en` | Language: `en`, `de` |

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/homepage?lang=en"
```

**Response: `200 OK`**

```json
{
  "data": {
    "hero": {
      "type": "curated",
      "items": [
        {
          "id": "hero_001",
          "contentType": "article",
          "contentId": "art_a1b2c3",
          "title": "Berlin's Best Rooftop Bars for Summer 2026",
          "subtitle": "Sip cocktails with panoramic views of the city skyline",
          "slug": "berlin-best-rooftop-bars-summer-2026",
          "url": "/articles/berlin-best-rooftop-bars-summer-2026",
          "imageUrl": "https://media.iloveberlin.biz/homepage/hero-rooftop-bars.jpg",
          "mobileImageUrl": "https://media.iloveberlin.biz/homepage/hero-rooftop-bars-mobile.jpg",
          "category": "Dining & Nightlife",
          "cta": {
            "text": "Discover the Best Views",
            "url": "/articles/berlin-best-rooftop-bars-summer-2026"
          },
          "order": 1
        },
        {
          "id": "hero_002",
          "contentType": "event",
          "contentId": "evt_d4e5f6",
          "title": "Berlin Gallery Weekend 2026",
          "subtitle": "50+ galleries open their doors for a weekend of contemporary art",
          "slug": "berlin-gallery-weekend-2026",
          "url": "/events/berlin-gallery-weekend-2026",
          "imageUrl": "https://media.iloveberlin.biz/homepage/hero-gallery-weekend.jpg",
          "mobileImageUrl": "https://media.iloveberlin.biz/homepage/hero-gallery-weekend-mobile.jpg",
          "category": "Culture & Art",
          "cta": {
            "text": "See the Full Programme",
            "url": "/events/berlin-gallery-weekend-2026"
          },
          "order": 2
        },
        {
          "id": "hero_003",
          "contentType": "competition",
          "contentId": "comp_a1b2c3",
          "title": "Win a Weekend at Hotel Adlon Kempinski",
          "subtitle": "Enter our luxury hotel giveaway - closes March 31",
          "slug": "win-weekend-hotel-adlon-kempinski",
          "url": "/competitions/win-weekend-hotel-adlon-kempinski",
          "imageUrl": "https://media.iloveberlin.biz/homepage/hero-adlon.jpg",
          "mobileImageUrl": "https://media.iloveberlin.biz/homepage/hero-adlon-mobile.jpg",
          "category": "Competitions",
          "cta": {
            "text": "Enter Now",
            "url": "/competitions/win-weekend-hotel-adlon-kempinski"
          },
          "order": 3
        }
      ]
    },
    "trending": {
      "title": "Trending Now",
      "items": [
        {
          "contentType": "article",
          "id": "art_g7h8i9",
          "title": "New U-Bahn Line U5 Extension: Everything You Need to Know",
          "slug": "u-bahn-u5-extension-guide",
          "url": "/articles/u-bahn-u5-extension-guide",
          "thumbnailUrl": "https://media.iloveberlin.biz/articles/thumbs/u5-extension.jpg",
          "category": "Getting Around",
          "readTime": "6 min",
          "publishedAt": "2026-03-11T08:00:00Z"
        },
        {
          "contentType": "article",
          "id": "art_j1k2l3",
          "title": "Where to Find the Best Döner in Berlin (2026 Update)",
          "slug": "best-doener-berlin-2026",
          "url": "/articles/best-doener-berlin-2026",
          "thumbnailUrl": "https://media.iloveberlin.biz/articles/thumbs/best-doener.jpg",
          "category": "Food & Drink",
          "readTime": "8 min",
          "publishedAt": "2026-03-09T10:00:00Z"
        },
        {
          "contentType": "article",
          "id": "art_m3n4o5",
          "title": "Anmeldung Guide: How to Register Your Address in Berlin",
          "slug": "anmeldung-guide-berlin",
          "url": "/articles/anmeldung-guide-berlin",
          "thumbnailUrl": "https://media.iloveberlin.biz/articles/thumbs/anmeldung-guide.jpg",
          "category": "Living in Berlin",
          "readTime": "10 min",
          "publishedAt": "2026-03-07T14:00:00Z"
        },
        {
          "contentType": "article",
          "id": "art_p6q7r8",
          "title": "10 Free Things to Do in Berlin This Spring",
          "slug": "free-things-berlin-spring",
          "url": "/articles/free-things-berlin-spring",
          "thumbnailUrl": "https://media.iloveberlin.biz/articles/thumbs/free-things-spring.jpg",
          "category": "Things to Do",
          "readTime": "5 min",
          "publishedAt": "2026-03-10T09:00:00Z"
        }
      ]
    },
    "events": {
      "title": "Upcoming Events",
      "viewAllUrl": "/events",
      "items": [
        {
          "id": "evt_s1t2u3",
          "title": "Berlinale Open Air Cinema",
          "slug": "berlinale-open-air-cinema",
          "url": "/events/berlinale-open-air-cinema",
          "thumbnailUrl": "https://media.iloveberlin.biz/events/thumbs/berlinale-open-air.jpg",
          "venue": "Museumsinsel",
          "district": "Mitte",
          "startDate": "2026-03-15T19:00:00Z",
          "endDate": "2026-03-15T23:00:00Z",
          "price": "12.00 EUR",
          "category": "Film"
        },
        {
          "id": "evt_v4w5x6",
          "title": "Flea Market at Mauerpark",
          "slug": "flea-market-mauerpark",
          "url": "/events/flea-market-mauerpark",
          "thumbnailUrl": "https://media.iloveberlin.biz/events/thumbs/mauerpark-flea.jpg",
          "venue": "Mauerpark",
          "district": "Prenzlauer Berg",
          "startDate": "2026-03-16T10:00:00Z",
          "endDate": "2026-03-16T18:00:00Z",
          "price": "Free",
          "category": "Markets"
        },
        {
          "id": "evt_y7z8a9",
          "title": "Techno Night at Tresor",
          "slug": "techno-night-tresor",
          "url": "/events/techno-night-tresor",
          "thumbnailUrl": "https://media.iloveberlin.biz/events/thumbs/tresor-techno.jpg",
          "venue": "Tresor Berlin",
          "district": "Mitte",
          "startDate": "2026-03-14T23:00:00Z",
          "endDate": "2026-03-15T10:00:00Z",
          "price": "15.00 EUR",
          "category": "Nightlife"
        }
      ]
    },
    "weekend": {
      "title": "This Weekend in Berlin",
      "subtitle": "March 14-16, 2026",
      "viewAllUrl": "/events?date=weekend",
      "items": [
        {
          "id": "evt_v4w5x6",
          "title": "Flea Market at Mauerpark",
          "slug": "flea-market-mauerpark",
          "url": "/events/flea-market-mauerpark",
          "thumbnailUrl": "https://media.iloveberlin.biz/events/thumbs/mauerpark-flea.jpg",
          "venue": "Mauerpark",
          "startDate": "2026-03-16T10:00:00Z",
          "category": "Markets",
          "price": "Free"
        },
        {
          "id": "evt_b1c2d3",
          "title": "Street Food Saturday at Markthalle Neun",
          "slug": "street-food-saturday-markthalle-neun",
          "url": "/events/street-food-saturday-markthalle-neun",
          "thumbnailUrl": "https://media.iloveberlin.biz/events/thumbs/markthalle-streetfood.jpg",
          "venue": "Markthalle Neun",
          "startDate": "2026-03-15T11:00:00Z",
          "category": "Food & Drink",
          "price": "Free entry"
        }
      ]
    },
    "dining": {
      "title": "Dining Picks",
      "viewAllUrl": "/dining",
      "items": [
        {
          "id": "din_e4f5g6",
          "title": "CODA Dessert Dining",
          "slug": "coda-dessert-dining",
          "url": "/dining/coda-dessert-dining",
          "thumbnailUrl": "https://media.iloveberlin.biz/dining/thumbs/coda.jpg",
          "cuisine": "Dessert Fine Dining",
          "district": "Neukölln",
          "priceRange": "$$$$",
          "rating": 4.9,
          "reviewCount": 28,
          "highlight": "Michelin-starred"
        },
        {
          "id": "din_h7i8j9",
          "title": "Curry 36",
          "slug": "curry-36",
          "url": "/dining/curry-36",
          "thumbnailUrl": "https://media.iloveberlin.biz/dining/thumbs/curry36.jpg",
          "cuisine": "German Street Food",
          "district": "Kreuzberg",
          "priceRange": "$",
          "rating": 4.3,
          "reviewCount": 156,
          "highlight": "Berlin Institution"
        },
        {
          "id": "din_k1l2m3",
          "title": "Nobelhart & Schmutzig",
          "slug": "nobelhart-schmutzig",
          "url": "/dining/nobelhart-schmutzig",
          "thumbnailUrl": "https://media.iloveberlin.biz/dining/thumbs/nobelhart.jpg",
          "cuisine": "New German",
          "district": "Kreuzberg",
          "priceRange": "$$$$",
          "rating": 4.8,
          "reviewCount": 42,
          "highlight": "Vocally Local"
        }
      ]
    },
    "videos": {
      "title": "Latest Videos",
      "viewAllUrl": "/videos",
      "items": [
        {
          "id": "vid_a1b2c3d4",
          "title": "Hidden Courtyards of Kreuzberg",
          "slug": "hidden-courtyards-kreuzberg",
          "url": "/videos/hidden-courtyards-kreuzberg",
          "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/hidden-courtyards-kreuzberg.jpg",
          "duration": 482,
          "views": 12840,
          "series": "Secret Berlin",
          "publishedAt": "2026-03-10T14:30:00Z"
        },
        {
          "id": "vid_n3o4p5",
          "title": "Berlin Wall Memorial: Then and Now",
          "slug": "berlin-wall-memorial-then-and-now",
          "url": "/videos/berlin-wall-memorial-then-and-now",
          "thumbnailUrl": "https://media.iloveberlin.biz/videos/thumbs/berlin-wall-memorial.jpg",
          "duration": 620,
          "views": 8400,
          "series": "Secret Berlin",
          "publishedAt": "2026-03-08T10:00:00Z"
        }
      ]
    },
    "competitions": {
      "title": "Win Prizes",
      "viewAllUrl": "/competitions",
      "items": [
        {
          "id": "comp_a1b2c3",
          "title": "Win a Weekend at Hotel Adlon Kempinski",
          "slug": "win-weekend-hotel-adlon-kempinski",
          "url": "/competitions/win-weekend-hotel-adlon-kempinski",
          "thumbnailUrl": "https://media.iloveberlin.biz/competitions/hotel-adlon-weekend.jpg",
          "prize": "Luxury Weekend Stay",
          "prizeValue": 890.00,
          "endsAt": "2026-03-31T23:59:59Z",
          "entryCount": 1243
        }
      ]
    },
    "classifieds": {
      "title": "Latest Classifieds",
      "viewAllUrl": "/classifieds",
      "items": [
        {
          "id": "cls_d4e5f6",
          "title": "Vintage Bianchi road bike - 56cm frame",
          "slug": "vintage-bianchi-road-bike-56cm-frame",
          "url": "/classifieds/vintage-bianchi-road-bike-56cm-frame",
          "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/bianchi-front.jpg",
          "price": 300.00,
          "currency": "EUR",
          "district": "Friedrichshain",
          "type": "for_sale",
          "createdAt": "2026-03-12T16:00:00Z"
        },
        {
          "id": "cls_g7h8i9",
          "title": "Sunny WG room in Prenzlauer Berg - available April",
          "slug": "sunny-wg-room-prenzlauer-berg",
          "url": "/classifieds/sunny-wg-room-prenzlauer-berg",
          "thumbnailUrl": "https://media.iloveberlin.biz/classifieds/thumbs/wg-room-pberg.jpg",
          "price": 550.00,
          "currency": "EUR",
          "district": "Prenzlauer Berg",
          "type": "housing",
          "createdAt": "2026-03-12T14:00:00Z"
        },
        {
          "id": "cls_j1k2l3",
          "title": "English-speaking babysitter available",
          "slug": "english-speaking-babysitter-available",
          "url": "/classifieds/english-speaking-babysitter-available",
          "thumbnailUrl": null,
          "price": 15.00,
          "currency": "EUR",
          "district": "Charlottenburg",
          "type": "services",
          "createdAt": "2026-03-11T18:00:00Z"
        }
      ]
    },
    "ad": {
      "placement": "homepage_hero",
      "campaign": {
        "id": "camp_a1b2c3",
        "name": "Hotel Adlon Spring Campaign",
        "imageUrl": "https://media.iloveberlin.biz/ads/adlon-spring-banner.jpg",
        "targetUrl": "https://www.kempinski.com/berlin",
        "altText": "Hotel Adlon Kempinski - Spring Special Offer",
        "impressionTrackingUrl": "https://iloveberlin.biz/api/v1/ads/track/imp/camp_a1b2c3"
      }
    }
  },
  "meta": {
    "cachedAt": "2026-03-12T18:00:00Z",
    "cacheExpiresAt": "2026-03-12T18:01:00Z",
    "lang": "en"
  }
}
```

---

## Admin Endpoints

### List Homepage Sections

```
GET /api/v1/admin/homepage/sections
```

Returns all homepage sections with their configuration, content sources, and display settings.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Example:**

```bash
curl -X GET "https://iloveberlin.biz/api/v1/admin/homepage/sections" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": "sec_hero",
      "name": "Hero Carousel",
      "slug": "hero",
      "type": "curated",
      "isVisible": true,
      "order": 1,
      "config": {
        "maxItems": 5,
        "autoRotate": true,
        "rotateIntervalMs": 6000,
        "showOnMobile": true
      },
      "items": [
        {
          "id": "hero_001",
          "contentType": "article",
          "contentId": "art_a1b2c3",
          "title": "Berlin's Best Rooftop Bars for Summer 2026",
          "order": 1,
          "addedAt": "2026-03-10T10:00:00Z",
          "addedBy": "usr_admin1"
        },
        {
          "id": "hero_002",
          "contentType": "event",
          "contentId": "evt_d4e5f6",
          "title": "Berlin Gallery Weekend 2026",
          "order": 2,
          "addedAt": "2026-03-09T14:00:00Z",
          "addedBy": "usr_admin1"
        },
        {
          "id": "hero_003",
          "contentType": "competition",
          "contentId": "comp_a1b2c3",
          "title": "Win a Weekend at Hotel Adlon Kempinski",
          "order": 3,
          "addedAt": "2026-03-01T09:00:00Z",
          "addedBy": "usr_admin2"
        }
      ],
      "updatedAt": "2026-03-10T10:00:00Z"
    },
    {
      "id": "sec_trending",
      "name": "Trending Now",
      "slug": "trending",
      "type": "automatic",
      "isVisible": true,
      "order": 2,
      "config": {
        "maxItems": 4,
        "source": "most_viewed",
        "period": "7d",
        "contentTypes": ["article"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-08T12:00:00Z"
    },
    {
      "id": "sec_events",
      "name": "Upcoming Events",
      "slug": "events",
      "type": "automatic",
      "isVisible": true,
      "order": 3,
      "config": {
        "maxItems": 6,
        "source": "upcoming",
        "contentTypes": ["event"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-07T09:00:00Z"
    },
    {
      "id": "sec_weekend",
      "name": "This Weekend",
      "slug": "weekend",
      "type": "automatic",
      "isVisible": true,
      "order": 4,
      "config": {
        "maxItems": 4,
        "source": "weekend_events",
        "contentTypes": ["event"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-07T09:00:00Z"
    },
    {
      "id": "sec_dining",
      "name": "Dining Picks",
      "slug": "dining",
      "type": "curated",
      "isVisible": true,
      "order": 5,
      "config": {
        "maxItems": 6,
        "showOnMobile": true
      },
      "items": [
        {
          "id": "din_pick_001",
          "contentType": "dining",
          "contentId": "din_e4f5g6",
          "title": "CODA Dessert Dining",
          "order": 1,
          "addedAt": "2026-03-01T10:00:00Z",
          "addedBy": "usr_admin1"
        }
      ],
      "updatedAt": "2026-03-01T10:00:00Z"
    },
    {
      "id": "sec_videos",
      "name": "Latest Videos",
      "slug": "videos",
      "type": "automatic",
      "isVisible": true,
      "order": 6,
      "config": {
        "maxItems": 4,
        "source": "latest",
        "contentTypes": ["video"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-06T11:00:00Z"
    },
    {
      "id": "sec_competitions",
      "name": "Win Prizes",
      "slug": "competitions",
      "type": "automatic",
      "isVisible": true,
      "order": 7,
      "config": {
        "maxItems": 3,
        "source": "active",
        "contentTypes": ["competition"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-05T15:00:00Z"
    },
    {
      "id": "sec_classifieds",
      "name": "Latest Classifieds",
      "slug": "classifieds",
      "type": "automatic",
      "isVisible": true,
      "order": 8,
      "config": {
        "maxItems": 6,
        "source": "latest",
        "contentTypes": ["classified"],
        "showOnMobile": true
      },
      "overrides": [],
      "updatedAt": "2026-03-04T14:00:00Z"
    }
  ]
}
```

---

### Update Homepage Section

```
PATCH /api/v1/admin/homepage/sections/:sectionId
```

Updates a homepage section's configuration, visibility, order, or curated content. Changes take effect after the current cache expires (within 60 seconds).

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sectionId` | string | The section ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | no | Section display name |
| `isVisible` | boolean | no | Show or hide the section |
| `order` | integer | no | Display order (1-based) |
| `config` | object | no | Section-specific configuration |
| `config.maxItems` | integer | no | Maximum items to display |
| `config.source` | string | no | Content source for automatic sections: `latest`, `most_viewed`, `upcoming`, `active`, `weekend_events` |
| `config.period` | string | no | Time period for trending: `24h`, `7d`, `30d` |
| `config.contentTypes` | string[] | no | Allowed content types |
| `config.autoRotate` | boolean | no | Auto-rotate (hero only) |
| `config.rotateIntervalMs` | integer | no | Rotation interval in ms (hero only) |
| `config.showOnMobile` | boolean | no | Show on mobile |
| `items` | object[] | no | Curated items (for `curated` type sections). Replaces all existing items |
| `items[].contentType` | string | yes | Content type: `article`, `event`, `dining`, `video`, `competition`, `classified` |
| `items[].contentId` | string | yes | Content item ID |
| `items[].order` | integer | yes | Display order |
| `items[].subtitle` | string | no | Custom subtitle override |
| `items[].imageMediaId` | string | no | Custom image override |
| `items[].cta` | object | no | Custom call-to-action |
| `overrides` | object[] | no | Manual overrides for automatic sections (pin specific items to top) |
| `overrides[].contentId` | string | yes | Content item ID to pin |
| `overrides[].position` | integer | yes | Pinned position |
| `clearCache` | boolean | no | Immediately invalidate the homepage cache (default: `false`) |

**Request Example (update curated hero):**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/homepage/sections/sec_hero" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "contentType": "event",
        "contentId": "evt_spring_fest",
        "order": 1,
        "subtitle": "Join us for the biggest spring celebration in Berlin",
        "cta": {
          "text": "Get Tickets",
          "url": "/events/berlin-spring-festival-2026"
        }
      },
      {
        "contentType": "article",
        "contentId": "art_a1b2c3",
        "order": 2
      },
      {
        "contentType": "competition",
        "contentId": "comp_a1b2c3",
        "order": 3
      }
    ],
    "clearCache": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "sec_hero",
    "name": "Hero Carousel",
    "slug": "hero",
    "type": "curated",
    "isVisible": true,
    "order": 1,
    "config": {
      "maxItems": 5,
      "autoRotate": true,
      "rotateIntervalMs": 6000,
      "showOnMobile": true
    },
    "items": [
      {
        "id": "hero_004",
        "contentType": "event",
        "contentId": "evt_spring_fest",
        "title": "Berlin Spring Festival 2026",
        "subtitle": "Join us for the biggest spring celebration in Berlin",
        "order": 1,
        "cta": {
          "text": "Get Tickets",
          "url": "/events/berlin-spring-festival-2026"
        },
        "addedAt": "2026-03-12T19:00:00Z",
        "addedBy": "usr_admin1"
      },
      {
        "id": "hero_005",
        "contentType": "article",
        "contentId": "art_a1b2c3",
        "title": "Berlin's Best Rooftop Bars for Summer 2026",
        "order": 2,
        "addedAt": "2026-03-12T19:00:00Z",
        "addedBy": "usr_admin1"
      },
      {
        "id": "hero_006",
        "contentType": "competition",
        "contentId": "comp_a1b2c3",
        "title": "Win a Weekend at Hotel Adlon Kempinski",
        "order": 3,
        "addedAt": "2026-03-12T19:00:00Z",
        "addedBy": "usr_admin1"
      }
    ],
    "cacheCleared": true,
    "updatedAt": "2026-03-12T19:00:00Z",
    "updatedBy": {
      "id": "usr_admin1",
      "firstName": "Max",
      "lastName": "Admin"
    }
  }
}
```

**Request Example (update automatic section with overrides):**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/homepage/sections/sec_events" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "maxItems": 8
    },
    "overrides": [
      {
        "contentId": "evt_spring_fest",
        "position": 1
      }
    ],
    "clearCache": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "sec_events",
    "name": "Upcoming Events",
    "slug": "events",
    "type": "automatic",
    "isVisible": true,
    "order": 3,
    "config": {
      "maxItems": 8,
      "source": "upcoming",
      "contentTypes": ["event"],
      "showOnMobile": true
    },
    "overrides": [
      {
        "contentId": "evt_spring_fest",
        "title": "Berlin Spring Festival 2026",
        "position": 1
      }
    ],
    "cacheCleared": true,
    "updatedAt": "2026-03-12T19:15:00Z"
  }
}
```

**Request Example (hide a section):**

```bash
curl -X PATCH "https://iloveberlin.biz/api/v1/admin/homepage/sections/sec_classifieds" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "isVisible": false,
    "clearCache": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "id": "sec_classifieds",
    "name": "Latest Classifieds",
    "slug": "classifieds",
    "isVisible": false,
    "cacheCleared": true,
    "updatedAt": "2026-03-12T19:20:00Z"
  }
}
```

**Error Response: `404 Not Found`**

```json
{
  "statusCode": 404,
  "message": "Homepage section not found",
  "error": "Not Found"
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": "Content item 'evt_nonexistent' not found. All referenced content must exist and be published.",
  "error": "Bad Request"
}
```

---

### Set Featured Items

```
PUT /api/v1/admin/homepage/featured
```

Sets the globally featured items displayed prominently across the site (not just the homepage). Featured items receive visual emphasis in listings and may appear in the hero section. Replaces all current featured items.

**Authentication:** Admin+ (`Authorization: Bearer <token>`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | object[] | yes | Array of featured items (max: 20) |
| `items[].contentType` | string | yes | Content type: `article`, `event`, `dining`, `video`, `guide`, `competition`, `product` |
| `items[].contentId` | string | yes | Content item ID |
| `items[].priority` | integer | yes | Priority (1 = highest). Determines display order when multiple featured items appear |
| `items[].startsAt` | string | no | ISO 8601 start date for featuring (default: now) |
| `items[].endsAt` | string | no | ISO 8601 end date for featuring (default: indefinite) |
| `items[].label` | string | no | Custom featured label (e.g., "Editor's Pick", "Staff Favorite") |
| `clearCache` | boolean | no | Immediately invalidate the homepage cache (default: `false`) |

**Request Example:**

```bash
curl -X PUT "https://iloveberlin.biz/api/v1/admin/homepage/featured" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "contentType": "article",
        "contentId": "art_a1b2c3",
        "priority": 1,
        "label": "Editor'\''s Pick",
        "endsAt": "2026-03-31T23:59:59Z"
      },
      {
        "contentType": "event",
        "contentId": "evt_d4e5f6",
        "priority": 2,
        "label": "Don'\''t Miss",
        "startsAt": "2026-03-14T00:00:00Z",
        "endsAt": "2026-03-16T23:59:59Z"
      },
      {
        "contentType": "dining",
        "contentId": "din_e4f5g6",
        "priority": 3,
        "label": "Staff Favorite"
      },
      {
        "contentType": "competition",
        "contentId": "comp_a1b2c3",
        "priority": 4,
        "endsAt": "2026-03-31T23:59:59Z"
      },
      {
        "contentType": "product",
        "contentId": "prod_a1b2c3",
        "priority": 5,
        "label": "Bestseller"
      }
    ],
    "clearCache": true
  }'
```

**Response: `200 OK`**

```json
{
  "data": {
    "featuredItems": [
      {
        "id": "feat_001",
        "contentType": "article",
        "contentId": "art_a1b2c3",
        "title": "Berlin's Best Rooftop Bars for Summer 2026",
        "slug": "berlin-best-rooftop-bars-summer-2026",
        "priority": 1,
        "label": "Editor's Pick",
        "startsAt": "2026-03-12T19:30:00Z",
        "endsAt": "2026-03-31T23:59:59Z"
      },
      {
        "id": "feat_002",
        "contentType": "event",
        "contentId": "evt_d4e5f6",
        "title": "Berlin Gallery Weekend 2026",
        "slug": "berlin-gallery-weekend-2026",
        "priority": 2,
        "label": "Don't Miss",
        "startsAt": "2026-03-14T00:00:00Z",
        "endsAt": "2026-03-16T23:59:59Z"
      },
      {
        "id": "feat_003",
        "contentType": "dining",
        "contentId": "din_e4f5g6",
        "title": "CODA Dessert Dining",
        "slug": "coda-dessert-dining",
        "priority": 3,
        "label": "Staff Favorite",
        "startsAt": "2026-03-12T19:30:00Z",
        "endsAt": null
      },
      {
        "id": "feat_004",
        "contentType": "competition",
        "contentId": "comp_a1b2c3",
        "title": "Win a Weekend at Hotel Adlon Kempinski",
        "slug": "win-weekend-hotel-adlon-kempinski",
        "priority": 4,
        "label": null,
        "startsAt": "2026-03-12T19:30:00Z",
        "endsAt": "2026-03-31T23:59:59Z"
      },
      {
        "id": "feat_005",
        "contentType": "product",
        "contentId": "prod_a1b2c3",
        "title": "I Love Berlin Classic Tee",
        "slug": "i-love-berlin-classic-tee",
        "priority": 5,
        "label": "Bestseller",
        "startsAt": "2026-03-12T19:30:00Z",
        "endsAt": null
      }
    ],
    "totalItems": 5,
    "previousItemCount": 3,
    "cacheCleared": true,
    "updatedAt": "2026-03-12T19:30:00Z",
    "updatedBy": {
      "id": "usr_admin1",
      "firstName": "Max",
      "lastName": "Admin"
    }
  }
}
```

**Error Response: `400 Bad Request`**

```json
{
  "statusCode": 400,
  "message": [
    "Maximum 20 featured items allowed",
    "Content item 'art_nonexistent' not found or is not published"
  ],
  "error": "Bad Request"
}
```

---

## Error Responses

All error responses follow this standard format:

```json
{
  "statusCode": 400,
  "message": "Description of what went wrong",
  "error": "Bad Request"
}
```

| Status Code | Error | Description |
|-------------|-------|-------------|
| `400` | Bad Request | Invalid section configuration, referenced content not found, or exceeds item limits |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions for admin endpoints |
| `404` | Not Found | Homepage section not found |
| `422` | Unprocessable Entity | Invalid content type or configuration value |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| `GET /homepage` | 120 requests | 1 minute |
| `GET /admin/homepage/sections` | 30 requests | 1 minute |
| `PATCH /admin/homepage/sections/:sectionId` | 10 requests | 1 minute |
| `PUT /admin/homepage/featured` | 10 requests | 1 minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1710288000
```

**Rate Limit Exceeded Response: `429 Too Many Requests`**

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```

---

## Caching Behavior

| Endpoint | Cache Strategy | TTL |
|----------|---------------|-----|
| `GET /homepage` | Server-side (Redis) + CDN edge cache | 60 seconds |
| Admin endpoints | No caching | — |

The homepage response includes cache metadata:

```json
{
  "meta": {
    "cachedAt": "2026-03-12T18:00:00Z",
    "cacheExpiresAt": "2026-03-12T18:01:00Z"
  }
}
```

Admin updates with `clearCache: true` immediately invalidate both server-side and CDN caches, ensuring changes are visible within seconds.
