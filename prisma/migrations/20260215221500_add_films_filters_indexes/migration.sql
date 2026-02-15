CREATE INDEX IF NOT EXISTS idx_film_countries_country_id
ON film_countries(country_id);

CREATE INDEX IF NOT EXISTS idx_film_genres_genre_id
ON film_genres(genre_id);

CREATE INDEX IF NOT EXISTS idx_film_tags_tag_id
ON film_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_films_status_release_year
ON films(status, release_year DESC);

CREATE INDEX IF NOT EXISTS idx_films_status_average_rating
ON films(status, average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_films_status_popularity
ON films(status, popularity_score DESC);
