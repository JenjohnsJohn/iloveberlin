# ILoveBerlin -- Entity Relationship Diagram

> ASCII ERD grouped by domain. Notation: `PK` = primary key, `FK` = foreign key, `UK` = unique key, `>>` = references.

---

## High-Level Domain Map

```
 +------------------+       +------------------+       +------------------+
 |   AUTH / USERS   |       |     CONTENT      |       |      GUIDES      |
 |                  |       |                  |       |                  |
 | users            |<------| articles         |       | guide_topics     |
 | refresh_tokens   |       | categories       |------>| guides           |
 | user_bookmarks   |       | tags             |       +------------------+
 +------------------+       | article_tags     |
         |                  | article_revisions|
         |                  +------------------+
         |
         |  +------------------+       +------------------+
         |  |      EVENTS      |       |      DINING      |
         |  |                  |       |                  |
         +->| venues           |       | cuisines         |
         |  | events           |       | restaurants      |
         |  +------------------+       | restaurant_      |
         |                             |   cuisines       |
         |                             | restaurant_      |
         |                             |   images         |
         |                             | dining_offers    |
         |                             +------------------+
         |
         |  +------------------+       +------------------+
         |  |      VIDEOS      |       |  COMPETITIONS    |
         |  |                  |       |                  |
         +->| video_series     |       | competitions     |
         |  | videos           |       | competition_     |
         |  | video_tags       |       |   entries        |
         |  +------------------+       +------------------+
         |
         |  +------------------+       +------------------+
         |  |   CLASSIFIEDS    |       |      STORE       |
         |  |                  |       |                  |
         +->| classified_      |       | product_         |
         |  |   categories     |       |   categories     |
         |  | classifieds      |       | products         |
         |  | classified_      |       | product_variants |
         |  |   images         |       | product_images   |
         |  | classified_      |       | carts            |
         |  |   messages       |       | cart_items        |
         |  | classified_      |       | orders           |
         |  |   reports        |       | order_items      |
         |  +------------------+       | discount_codes   |
         |                             +------------------+
         |
         |  +------------------+       +------------------+
         +->|      MEDIA       |       |      ADMIN       |
            |                  |       |                  |
            | media            |       | admin_activity_  |
            +------------------+       |   log            |
                                       | homepage_featured|
                                       | ad_campaigns     |
                                       | ad_placements    |
                                       | notification_    |
                                       |   preferences    |
                                       +------------------+
```

---

## Detailed ERD by Domain

### 1. Auth / Users

```
+-------------------------------+        +----------------------------+
|           users               |        |     refresh_tokens         |
+-------------------------------+        +----------------------------+
| PK  id             UUID       |<-------| PK  id           UUID     |
|     email          VARCHAR    |   |    | FK  user_id      UUID     |
|     password_hash  VARCHAR    |   |    |     token_hash   VARCHAR  |
|     display_name   VARCHAR    |   |    |     expires_at   TIMESTAMPTZ|
|     role           ENUM       |   |    |     revoked_at   TIMESTAMPTZ|
|     email_verified BOOLEAN    |   |    |     created_at   TIMESTAMPTZ|
|     avatar_url     VARCHAR    |   |    +----------------------------+
|     bio            TEXT       |   |         user_id >> users.id
|     location       VARCHAR    |   |         ON DELETE CASCADE
|     social_links   JSONB      |   |
|     status         ENUM       |   |
|     last_login_at  TIMESTAMPTZ|   |    +----------------------------+
|     login_attempts INTEGER    |   |    |     user_bookmarks         |
|     locked_until   TIMESTAMPTZ|   |    +----------------------------+
|     created_at     TIMESTAMPTZ|   |    | PK  id           UUID     |
|     updated_at     TIMESTAMPTZ|   +----| FK  user_id      UUID     |
|     deleted_at     TIMESTAMPTZ|        |     bookmarkable_type VARCHAR|
+-------------------------------+        |     bookmarkable_id   UUID |
  UK: email (WHERE deleted_at IS NULL)   |     created_at   TIMESTAMPTZ|
                                         +----------------------------+
                                           user_id >> users.id
                                           ON DELETE CASCADE
                                           UK: (user_id, bookmarkable_type,
                                                bookmarkable_id)
```

### 2. Content

```
+-------------------------------+        +----------------------------+
|         categories            |        |          tags              |
+-------------------------------+        +----------------------------+
| PK  id             UUID       |        | PK  id           UUID     |
|     name           VARCHAR    |        |     name         VARCHAR  |
|     slug           VARCHAR UK |        |     slug         VARCHAR UK|
|     description    TEXT       |        |     created_at   TIMESTAMPTZ|
| FK  parent_id      UUID NULL  |        +----------------------------+
|     sort_order     INTEGER    |
|     type           ENUM       |
+-------------------------------+
  parent_id >> categories.id (self-ref)
  ON DELETE SET NULL

+----------------------------------------------+
|                  articles                     |
+----------------------------------------------+
| PK  id                UUID                    |
|     title             VARCHAR                 |
|     subtitle          VARCHAR NULL            |
|     slug              VARCHAR UK              |
|     body              TEXT                    |
|     excerpt           TEXT                    |
| FK  featured_image_id UUID NULL >> media.id   |
| FK  category_id       UUID NULL >> categories |
| FK  author_id         UUID NULL >> users.id   |
|     status            ENUM                    |
|     published_at      TIMESTAMPTZ             |
|     scheduled_at      TIMESTAMPTZ NULL        |
|     view_count        INTEGER DEFAULT 0       |
|     read_time_minutes SMALLINT                |
|     seo_title         VARCHAR NULL            |
|     seo_description   VARCHAR NULL            |
|     seo_keywords      VARCHAR NULL            |
|     created_at        TIMESTAMPTZ             |
|     updated_at        TIMESTAMPTZ             |
|     deleted_at        TIMESTAMPTZ NULL        |
+----------------------------------------------+

+---------------------+       +-------------------------------+
|   article_tags      |       |     article_revisions         |
+---------------------+       +-------------------------------+
| FK article_id  UUID |       | PK  id            UUID        |
| FK tag_id      UUID |       | FK  article_id    UUID        |
+---------------------+       |     title         VARCHAR     |
  PK: (article_id,            |     body          TEXT        |
       tag_id)                | FK  edited_by     UUID        |
  article_id >> articles.id   |     created_at    TIMESTAMPTZ |
    ON DELETE CASCADE          +-------------------------------+
  tag_id >> tags.id             article_id >> articles.id
    ON DELETE CASCADE             ON DELETE CASCADE
                                edited_by >> users.id
                                  ON DELETE SET NULL
```

### 3. Guides

```
+-------------------------------+        +-------------------------------+
|       guide_topics            |        |           guides              |
+-------------------------------+        +-------------------------------+
| PK  id             UUID       |<-------| PK  id              UUID     |
|     name           VARCHAR    |        | FK  topic_id        UUID     |
|     slug           VARCHAR UK |        |     title           VARCHAR  |
|     description    TEXT       |        |     slug            VARCHAR UK|
|     icon           VARCHAR    |        |     body            TEXT     |
|     sort_order     INTEGER    |        |     excerpt         TEXT     |
|     created_at     TIMESTAMPTZ|        | FK  featured_image_id UUID   |
+-------------------------------+        | FK  author_id       UUID     |
                                         |     status          ENUM    |
                                         |     last_reviewed_at TIMESTAMPTZ|
                                         |     seo_title       VARCHAR  |
                                         |     seo_description VARCHAR  |
                                         |     published_at    TIMESTAMPTZ|
                                         |     created_at      TIMESTAMPTZ|
                                         |     updated_at      TIMESTAMPTZ|
                                         |     deleted_at      TIMESTAMPTZ|
                                         +-------------------------------+
                                           topic_id >> guide_topics.id
                                             ON DELETE SET NULL
                                           author_id >> users.id
                                             ON DELETE SET NULL
                                           featured_image_id >> media.id
                                             ON DELETE SET NULL
```

### 4. Events

```
+-------------------------------+        +----------------------------------------------+
|          venues               |        |                events                        |
+-------------------------------+        +----------------------------------------------+
| PK  id             UUID       |<-------| PK  id                UUID                   |
|     name           VARCHAR    |        |     title             VARCHAR                |
|     slug           VARCHAR UK |        |     slug              VARCHAR UK             |
|     address        VARCHAR    |        |     description       TEXT                   |
|     district       VARCHAR    |        |     excerpt           TEXT                   |
|     latitude       DECIMAL    |        | FK  venue_id          UUID >> venues.id      |
|     longitude      DECIMAL    |        | FK  category_id       UUID >> categories.id  |
|     website        VARCHAR    |        |     start_date        DATE                   |
|     phone          VARCHAR    |        |     end_date          DATE NULL              |
|     capacity       INTEGER    |        |     start_time        TIME                   |
|     description    TEXT       |        |     end_time          TIME NULL              |
|     created_at     TIMESTAMPTZ|        |     is_recurring      BOOLEAN                |
|     updated_at     TIMESTAMPTZ|        |     rrule             VARCHAR NULL            |
+-------------------------------+        |     is_free           BOOLEAN                |
                                         |     price             DECIMAL NULL            |
                                         |     price_max         DECIMAL NULL            |
                                         |     ticket_url        VARCHAR NULL            |
                                         | FK  featured_image_id UUID >> media.id        |
                                         |     status            ENUM                    |
                                         | FK  submitted_by      UUID >> users.id        |
                                         | FK  approved_by       UUID NULL >> users.id   |
                                         |     created_at        TIMESTAMPTZ             |
                                         |     updated_at        TIMESTAMPTZ             |
                                         |     deleted_at        TIMESTAMPTZ NULL        |
                                         +----------------------------------------------+
```

### 5. Dining

```
+-------------------------------+
|          cuisines             |
+-------------------------------+
| PK  id             UUID       |
|     name           VARCHAR    |
|     slug           VARCHAR UK |
|     sort_order     INTEGER    |
+-------------------------------+
         |
         |   +-------------------------------+
         |   |       restaurants             |
         |   +-------------------------------+
         |   | PK  id              UUID      |
         |   |     name            VARCHAR   |
         |   |     slug            VARCHAR UK|
         |   |     description     TEXT      |
         |   |     address         VARCHAR   |
         |   |     district        VARCHAR   |
         |   |     latitude        DECIMAL   |
         |   |     longitude       DECIMAL   |
         |   |     phone           VARCHAR   |
         |   |     website         VARCHAR   |
         |   |     email           VARCHAR   |
         |   |     price_range     ENUM      |
         |   |     rating          DECIMAL   |
         |   |     opening_hours   JSONB     |
         |   | FK  featured_image_id UUID    |
         |   |     status          ENUM      |
         |   |     created_at      TIMESTAMPTZ|
         |   |     updated_at      TIMESTAMPTZ|
         |   |     deleted_at      TIMESTAMPTZ|
         |   +-------------------------------+
         |            |                |
+--------|------------|--+    +--------|-------------------+
| restaurant_cuisines    |    |   restaurant_images        |
+------------------------+    +----------------------------+
| FK restaurant_id UUID  |    | PK  id            UUID     |
| FK cuisine_id    UUID  |    | FK  restaurant_id UUID     |
+------------------------+    | FK  media_id      UUID     |
  PK: (restaurant_id,        |     sort_order    INTEGER   |
       cuisine_id)            |     caption       VARCHAR   |
                              +----------------------------+

+-------------------------------+
|       dining_offers           |
+-------------------------------+
| PK  id              UUID      |
| FK  restaurant_id   UUID      |
|     title           VARCHAR   |
|     description     TEXT      |
|     start_date      DATE      |
|     end_date        DATE      |
|     is_active       BOOLEAN   |
|     created_at      TIMESTAMPTZ|
+-------------------------------+
  restaurant_id >> restaurants.id
    ON DELETE CASCADE
```

### 6. Videos

```
+-------------------------------+        +-------------------------------+
|       video_series            |        |          videos               |
+-------------------------------+        +-------------------------------+
| PK  id             UUID       |<-------| PK  id              UUID     |
|     name           VARCHAR    |        |     title           VARCHAR  |
|     slug           VARCHAR UK |        |     slug            VARCHAR UK|
|     description    TEXT       |        |     description     TEXT     |
| FK  thumbnail_id   UUID      |        |     video_url       VARCHAR  |
|     sort_order     INTEGER    |        |     video_provider  ENUM    |
|     created_at     TIMESTAMPTZ|        | FK  thumbnail_id    UUID     |
+-------------------------------+        | FK  series_id       UUID NULL|
                                         | FK  category_id     UUID NULL|
                                         |     duration_seconds INTEGER |
                                         |     view_count      INTEGER  |
                                         |     status          ENUM    |
                                         |     published_at    TIMESTAMPTZ|
                                         |     created_at      TIMESTAMPTZ|
                                         |     updated_at      TIMESTAMPTZ|
                                         |     deleted_at      TIMESTAMPTZ|
                                         +-------------------------------+

                              +---------------------+
                              |    video_tags        |
                              +---------------------+
                              | FK video_id    UUID  |
                              | FK tag_id      UUID  |
                              +---------------------+
                                PK: (video_id, tag_id)
```

### 7. Competitions

```
+----------------------------------------------+
|              competitions                     |
+----------------------------------------------+
| PK  id                   UUID                 |
|     title                VARCHAR              |
|     slug                 VARCHAR UK           |
|     description          TEXT                 |
|     prize_description    TEXT                 |
| FK  featured_image_id    UUID >> media.id     |
|     start_date           TIMESTAMPTZ          |
|     end_date             TIMESTAMPTZ          |
|     status               ENUM                 |
|     terms_conditions     TEXT                 |
|     max_entries          INTEGER NULL          |
| FK  winner_id            UUID NULL >> users.id|
|     winner_selected_at   TIMESTAMPTZ NULL     |
|     created_at           TIMESTAMPTZ          |
|     updated_at           TIMESTAMPTZ          |
|     deleted_at           TIMESTAMPTZ NULL     |
+----------------------------------------------+
            |
            |
+----------------------------------------------+
|          competition_entries                   |
+----------------------------------------------+
| PK  id                UUID                    |
| FK  competition_id    UUID >> competitions.id |
| FK  user_id           UUID >> users.id        |
|     entry_data        JSONB                   |
|     created_at        TIMESTAMPTZ             |
+----------------------------------------------+
  UK: (competition_id, user_id)
  competition_id ON DELETE CASCADE
  user_id ON DELETE CASCADE
```

### 8. Classifieds

```
+----------------------------+       +----------------------------------------------+
| classified_categories      |       |              classifieds                      |
+----------------------------+       +----------------------------------------------+
| PK  id          UUID       |<------| PK  id               UUID                    |
|     name        VARCHAR    |       |     title            VARCHAR                 |
|     slug        VARCHAR UK |       |     slug             VARCHAR UK              |
|     icon        VARCHAR    |       |     description      TEXT                    |
|     sort_order  INTEGER    |       |     price            DECIMAL NULL             |
+----------------------------+       | FK  category_id      UUID                    |
                                     | FK  user_id          UUID >> users.id         |
                                     |     district         VARCHAR                 |
                                     |     contact_method   ENUM                    |
                                     |     status           ENUM                    |
                                     |     moderator_notes  TEXT NULL                |
                                     |     featured         BOOLEAN DEFAULT FALSE   |
                                     |     expires_at       TIMESTAMPTZ             |
                                     |     created_at       TIMESTAMPTZ             |
                                     |     updated_at       TIMESTAMPTZ             |
                                     |     deleted_at       TIMESTAMPTZ NULL        |
                                     +----------------------------------------------+
                                               |              |
                    +--------------------------+              |
                    |                                          |
+----------------------------+       +----------------------------+
| classified_images          |       | classified_messages        |
+----------------------------+       +----------------------------+
| PK  id          UUID       |       | PK  id          UUID       |
| FK  classified_id UUID     |       | FK  classified_id UUID     |
| FK  media_id     UUID      |       | FK  sender_id    UUID      |
|     sort_order   INTEGER   |       | FK  receiver_id  UUID      |
+----------------------------+       |     message      TEXT       |
                                     |     read_at      TIMESTAMPTZ|
                                     |     created_at   TIMESTAMPTZ|
                                     +----------------------------+

+----------------------------+
| classified_reports         |
+----------------------------+
| PK  id          UUID       |
| FK  classified_id UUID     |
| FK  reporter_id  UUID      |
|     reason       TEXT       |
|     status       ENUM       |
|     moderator_notes TEXT    |
|     created_at   TIMESTAMPTZ|
|     resolved_at  TIMESTAMPTZ|
+----------------------------+
```

### 9. Store

```
+-----------------------------+       +-------------------------------+
| product_categories          |       |         products              |
+-----------------------------+       +-------------------------------+
| PK  id          UUID        |<------| PK  id              UUID     |
|     name        VARCHAR     |       |     name            VARCHAR  |
|     slug        VARCHAR UK  |       |     slug            VARCHAR UK|
|     sort_order  INTEGER     |       |     description     TEXT     |
+-----------------------------+       |     base_price      DECIMAL  |
                                      | FK  category_id     UUID     |
                                      | FK  featured_image_id UUID   |
                                      |     status          ENUM    |
                                      |     created_at      TIMESTAMPTZ|
                                      |     updated_at      TIMESTAMPTZ|
                                      |     deleted_at      TIMESTAMPTZ|
                                      +-------------------------------+
                                               |            |
                    +--------------------------+            |
                    |                                        |
+-------------------------------+    +----------------------------+
|      product_variants         |    |    product_images          |
+-------------------------------+    +----------------------------+
| PK  id              UUID      |    | PK  id          UUID       |
| FK  product_id      UUID      |    | FK  product_id  UUID       |
|     name            VARCHAR   |    | FK  media_id    UUID       |
|     sku             VARCHAR UK|    |     sort_order  INTEGER    |
|     price           DECIMAL   |    +----------------------------+
|     stock_quantity  INTEGER   |
|     attributes      JSONB     |
+-------------------------------+

+----------------------------+       +----------------------------+
|          carts             |       |       cart_items            |
+----------------------------+       +----------------------------+
| PK  id          UUID       |<------| PK  id          UUID       |
| FK  user_id     UUID NULL  |       | FK  cart_id     UUID       |
|     session_id  VARCHAR    |       | FK  variant_id  UUID       |
|     created_at  TIMESTAMPTZ|       |     quantity    INTEGER    |
|     updated_at  TIMESTAMPTZ|       +----------------------------+
+----------------------------+

+-------------------------------+       +-------------------------------+
|          orders               |       |       order_items             |
+-------------------------------+       +-------------------------------+
| PK  id              UUID      |<------| PK  id             UUID      |
| FK  user_id         UUID      |       | FK  order_id       UUID      |
|     status          ENUM      |       | FK  variant_id     UUID NULL |
|     subtotal        DECIMAL   |       |     product_name   VARCHAR   |
|     discount_amount DECIMAL   |       |     variant_name   VARCHAR   |
|     total           DECIMAL   |       |     price          DECIMAL   |
|     shipping_address JSONB    |       |     quantity       INTEGER   |
|     stripe_payment_          |       +-------------------------------+
|       intent_id     VARCHAR   |
|     created_at      TIMESTAMPTZ|
|     updated_at      TIMESTAMPTZ|
+-------------------------------+

+-------------------------------+
|       discount_codes          |
+-------------------------------+
| PK  id              UUID      |
|     code            VARCHAR UK|
|     type            ENUM      |
|     value           DECIMAL   |
|     min_order_amount DECIMAL  |
|     max_uses        INTEGER   |
|     used_count      INTEGER   |
|     valid_from      TIMESTAMPTZ|
|     valid_until     TIMESTAMPTZ|
|     created_at      TIMESTAMPTZ|
+-------------------------------+
```

### 10. Media

```
+-------------------------------+
|           media               |
+-------------------------------+
| PK  id              UUID      |
|     filename        VARCHAR   |
|     original_filename VARCHAR |
|     mime_type       VARCHAR   |
|     size_bytes      INTEGER   |
|     storage_key     VARCHAR UK|
|     url             VARCHAR   |
|     thumbnail_url   VARCHAR   |
|     small_url       VARCHAR   |
|     medium_url      VARCHAR   |
|     large_url       VARCHAR   |
|     width           INTEGER   |
|     height          INTEGER   |
|     alt_text        VARCHAR   |
| FK  uploaded_by     UUID      |
|     created_at      TIMESTAMPTZ|
|     deleted_at      TIMESTAMPTZ|
+-------------------------------+
  uploaded_by >> users.id
    ON DELETE SET NULL
```

### 11. Admin

```
+-------------------------------+       +-------------------------------+
|    admin_activity_log         |       |     homepage_featured         |
+-------------------------------+       +-------------------------------+
| PK  id             UUID       |       | PK  id             UUID      |
| FK  user_id        UUID       |       |     section        ENUM      |
|     action         VARCHAR    |       |     content_type   VARCHAR   |
|     entity_type    VARCHAR    |       |     content_id     UUID      |
|     entity_id      UUID       |       |     sort_order     INTEGER   |
|     details        JSONB      |       |     created_at     TIMESTAMPTZ|
|     ip_address     INET       |       |     updated_at     TIMESTAMPTZ|
|     created_at     TIMESTAMPTZ|       +-------------------------------+
+-------------------------------+

+-------------------------------+       +-------------------------------+
|       ad_campaigns            |       |      ad_placements            |
+-------------------------------+       +-------------------------------+
| PK  id             UUID       |<------| PK  id             UUID      |
|     name           VARCHAR    |       | FK  campaign_id    UUID      |
|     advertiser     VARCHAR    |       |     position       ENUM      |
|     start_date     DATE       |       |     image_url      VARCHAR   |
|     end_date       DATE       |       |     target_url     VARCHAR   |
|     budget         DECIMAL    |       |     impressions    INTEGER   |
|     status         ENUM       |       |     clicks         INTEGER   |
|     created_at     TIMESTAMPTZ|       |     created_at     TIMESTAMPTZ|
|     updated_at     TIMESTAMPTZ|       |     updated_at     TIMESTAMPTZ|
+-------------------------------+       +-------------------------------+

+-------------------------------+
| notification_preferences      |
+-------------------------------+
| PK  id                UUID    |
| FK  user_id           UUID UK |
|     email_new_articles BOOLEAN|
|     email_competitions BOOLEAN|
|     push_events       BOOLEAN |
|     push_articles     BOOLEAN |
|     created_at        TIMESTAMPTZ|
|     updated_at        TIMESTAMPTZ|
+-------------------------------+
  user_id >> users.id
    ON DELETE CASCADE
```

---

## Cross-Domain Relationships Summary

| From | To | Relationship | FK Column |
|------|----|-------------|-----------|
| refresh_tokens | users | Many:1 | user_id |
| user_bookmarks | users | Many:1 | user_id |
| articles | users | Many:1 | author_id |
| articles | categories | Many:1 | category_id |
| articles | media | Many:1 | featured_image_id |
| article_tags | articles, tags | Many:Many join | article_id, tag_id |
| article_revisions | articles | Many:1 | article_id |
| article_revisions | users | Many:1 | edited_by |
| guides | guide_topics | Many:1 | topic_id |
| guides | users | Many:1 | author_id |
| guides | media | Many:1 | featured_image_id |
| events | venues | Many:1 | venue_id |
| events | categories | Many:1 | category_id |
| events | media | Many:1 | featured_image_id |
| events | users | Many:1 | submitted_by, approved_by |
| restaurants | media | Many:1 | featured_image_id |
| restaurant_cuisines | restaurants, cuisines | Many:Many join | restaurant_id, cuisine_id |
| restaurant_images | restaurants, media | bridge | restaurant_id, media_id |
| dining_offers | restaurants | Many:1 | restaurant_id |
| videos | video_series | Many:1 | series_id |
| videos | categories | Many:1 | category_id |
| videos | media | Many:1 | thumbnail_id |
| video_tags | videos, tags | Many:Many join | video_id, tag_id |
| competitions | media | Many:1 | featured_image_id |
| competitions | users | Many:1 | winner_id |
| competition_entries | competitions, users | Many:Many join | competition_id, user_id |
| classifieds | classified_categories | Many:1 | category_id |
| classifieds | users | Many:1 | user_id |
| classified_images | classifieds, media | bridge | classified_id, media_id |
| classified_messages | classifieds, users | Many:1 | classified_id, sender_id, receiver_id |
| classified_reports | classifieds, users | Many:1 | classified_id, reporter_id |
| products | product_categories | Many:1 | category_id |
| products | media | Many:1 | featured_image_id |
| product_variants | products | Many:1 | product_id |
| product_images | products, media | bridge | product_id, media_id |
| cart_items | carts, product_variants | Many:1 | cart_id, variant_id |
| carts | users | Many:1 | user_id (nullable) |
| orders | users | Many:1 | user_id |
| order_items | orders, product_variants | Many:1 | order_id, variant_id |
| admin_activity_log | users | Many:1 | user_id |
| ad_placements | ad_campaigns | Many:1 | campaign_id |
| notification_preferences | users | 1:1 | user_id |
| media | users | Many:1 | uploaded_by |
