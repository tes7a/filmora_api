-- DropIndex
DROP INDEX "idx_films_status_average_rating";

-- DropIndex
DROP INDEX "idx_films_status_popularity";

-- DropIndex
DROP INDEX "idx_films_status_release_year";

-- CreateIndex
CREATE INDEX "idx_films_status_release_year" ON "films"("status", "release_year");

-- CreateIndex
CREATE INDEX "idx_films_status_average_rating" ON "films"("status", "average_rating");

-- CreateIndex
CREATE INDEX "idx_films_status_popularity" ON "films"("status", "popularity_score");
