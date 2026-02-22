ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_film_unique UNIQUE (user_id, film_id);
