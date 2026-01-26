--
-- PostgreSQL database dump
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: action_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_type AS ENUM (
    'hide_review',
    'unhide_review',
    'hide_comment',
    'unhide_comment',
    'block_user',
    'unblock_user',
    'hide_film',
    'unhide_film'
);


--
-- Name: code_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.code_role AS ENUM (
    'user',
    'moderator',
    'admin'
);


--
-- Name: comment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_status AS ENUM (
    'visible',
    'hidden',
    'deleted'
);


--
-- Name: complaint_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.complaint_status AS ENUM (
    'pending',
    'in_review',
    'resolved',
    'rejected'
);


--
-- Name: film_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.film_status AS ENUM (
    'visible',
    'hidden',
    'deleted'
);


--
-- Name: genre_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genre_status AS ENUM (
    'active',
    'hidden',
    'deleted'
);


--
-- Name: list_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.list_type AS ENUM (
    'watchlist',
    'watched',
    'custom'
);


--
-- Name: person_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.person_status AS ENUM (
    'visible',
    'hidden',
    'merged',
    'deleted'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'visible',
    'hidden',
    'deleted'
);


--
-- Name: role_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role_type AS ENUM (
    'actor',
    'director',
    'writer',
    'producer',
    'other'
);


--
-- Name: tag_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tag_status AS ENUM (
    'active',
    'hidden',
    'deleted'
);


--
-- Name: target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.target_type AS ENUM (
    'review',
    'comment'
);


--
-- Name: target_type_ext; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.target_type_ext AS ENUM (
    'review',
    'comment',
    'user',
    'film'
);


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'blocked',
    'deleted'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    refresh_token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone,
    ip character varying(64),
    user_agent character varying(255)
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    body text NOT NULL,
    status public.comment_status DEFAULT 'visible'::public.comment_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_type public.target_type NOT NULL,
    target_id uuid NOT NULL,
    reason text NOT NULL,
    status public.complaint_status DEFAULT 'pending'::public.complaint_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone
);


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character(2) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone CONSTRAINT countries_crerated_at_not_null NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: film_countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.film_countries (
    film_id uuid NOT NULL,
    country_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: film_genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.film_genres (
    film_id uuid NOT NULL,
    genre_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: film_person_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.film_person_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    film_id uuid NOT NULL,
    person_id uuid NOT NULL,
    role_type public.role_type NOT NULL,
    character_name character varying(255),
    billing_order integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: film_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.film_tags (
    film_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: films; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.films (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    original_title character varying(255) NOT NULL,
    description text,
    release_year integer NOT NULL,
    duration_min integer NOT NULL,
    age_rating character varying(16),
    status public.film_status NOT NULL,
    average_rating numeric(3,1) DEFAULT 0.0 NOT NULL,
    ratings_count integer DEFAULT 0 NOT NULL,
    popularity_score numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    status public.genre_status NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    applied_at timestamp without time zone NOT NULL
);


--
-- Name: moderation_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    moderator_id uuid NOT NULL,
    target_type public.target_type_ext NOT NULL,
    target_id uuid NOT NULL,
    action_type public.action_type NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    complaint_id uuid
);


--
-- Name: persons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.persons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    birth_date date,
    death_date date,
    bio text,
    status public.person_status NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    film_id uuid NOT NULL,
    score integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_score_range CHECK (((score >= 1) AND (score <= 10)))
);


--
-- Name: review_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    version_number integer NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    edited_by_user_id uuid
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    film_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status public.review_status DEFAULT 'visible'::public.review_status NOT NULL,
    current_version_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() CONSTRAINT reviews_update_at_not_null NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code public.code_role NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    status public.tag_status NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone CONSTRAINT tags_update_at_not_null NOT NULL
);


--
-- Name: user_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_list_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    list_id uuid NOT NULL,
    user_id uuid NOT NULL,
    film_id uuid NOT NULL,
    "position" integer,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type public.list_type NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    status public.user_status NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone CONSTRAINT users_update_at_not_null NOT NULL,
    last_login_at timestamp without time zone
);

--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_refresh_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_refresh_token_key UNIQUE (refresh_token);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: countries countries_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_name_key UNIQUE (name);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: film_countries film_countries_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_countries
    ADD CONSTRAINT film_countries_pk PRIMARY KEY (film_id, country_id);


--
-- Name: film_genres film_genres_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_genres
    ADD CONSTRAINT film_genres_pk PRIMARY KEY (film_id, genre_id);


--
-- Name: film_person_roles film_person_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_person_roles
    ADD CONSTRAINT film_person_roles_pkey PRIMARY KEY (id);


--
-- Name: film_tags film_tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_tags
    ADD CONSTRAINT film_tags_pk PRIMARY KEY (film_id, tag_id);


--
-- Name: films films_original_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.films
    ADD CONSTRAINT films_original_title_key UNIQUE (original_title);


--
-- Name: films films_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.films
    ADD CONSTRAINT films_pkey PRIMARY KEY (id);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: genres genres_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_slug_key UNIQUE (slug);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: moderation_actions moderation_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT moderation_actions_pkey PRIMARY KEY (id);


--
-- Name: persons persons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);


--
-- Name: persons persons_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_slug_key UNIQUE (slug);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_user_film_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_film_unique UNIQUE (user_id, film_id);


--
-- Name: review_versions review_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_versions
    ADD CONSTRAINT review_versions_pkey PRIMARY KEY (id);


--
-- Name: review_versions review_versions_unique_version; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_versions
    ADD CONSTRAINT review_versions_unique_version UNIQUE (review_id, version_number);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: user_list_items user_list_items_no_duplicates; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_list_items
    ADD CONSTRAINT user_list_items_no_duplicates UNIQUE (user_id, list_id, film_id);


--
-- Name: user_list_items user_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_list_items
    ADD CONSTRAINT user_list_items_pkey PRIMARY KEY (id);


--
-- Name: user_lists user_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lists
    ADD CONSTRAINT user_lists_pkey PRIMARY KEY (id);


--
-- Name: user_lists user_lists_user_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lists
    ADD CONSTRAINT user_lists_user_name_unique UNIQUE (user_id, name);


--
-- Name: user_roles user_roles_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pk PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_auth_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_sessions_expires_at ON public.auth_sessions USING btree (expires_at);


--
-- Name: idx_auth_sessions_revoked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_sessions_revoked_at ON public.auth_sessions USING btree (revoked_at);


--
-- Name: idx_auth_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_sessions_user_id ON public.auth_sessions USING btree (user_id);


--
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);


--
-- Name: idx_comments_review_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_review_id ON public.comments USING btree (review_id);


--
-- Name: idx_complaints_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_status ON public.complaints USING btree (status);


--
-- Name: idx_complaints_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_target ON public.complaints USING btree (target_type, target_id);


--
-- Name: idx_complaints_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_user_id ON public.complaints USING btree (user_id);


--
-- Name: idx_moderation_actions_action_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_actions_action_type ON public.moderation_actions USING btree (action_type);


--
-- Name: idx_moderation_actions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_actions_created_at ON public.moderation_actions USING btree (created_at);


--
-- Name: idx_moderation_actions_moderator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_actions_moderator ON public.moderation_actions USING btree (moderator_id);


--
-- Name: idx_moderation_actions_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_actions_target ON public.moderation_actions USING btree (target_type, target_id);


--
-- Name: idx_ratings_film_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_film_id ON public.ratings USING btree (film_id);


--
-- Name: idx_ratings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);


--
-- Name: idx_user_list_items_film_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_list_items_film_id ON public.user_list_items USING btree (film_id);


--
-- Name: idx_user_list_items_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_list_items_list_id ON public.user_list_items USING btree (list_id);


--
-- Name: idx_user_list_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_list_items_user_id ON public.user_list_items USING btree (user_id);


--
-- Name: idx_user_lists_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lists_type ON public.user_lists USING btree (type);


--
-- Name: idx_user_lists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lists_user_id ON public.user_lists USING btree (user_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: auth_sessions auth_sessions_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_fk FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE SET NULL;


--
-- Name: comments comments_review_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_review_fk FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: film_countries film_countries_country_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_countries
    ADD CONSTRAINT film_countries_country_fk FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE CASCADE;


--
-- Name: film_countries film_countries_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_countries
    ADD CONSTRAINT film_countries_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: film_genres film_genres_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_genres
    ADD CONSTRAINT film_genres_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: film_genres film_genres_genre_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_genres
    ADD CONSTRAINT film_genres_genre_fk FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE;


--
-- Name: film_person_roles film_person_roles_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_person_roles
    ADD CONSTRAINT film_person_roles_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: film_person_roles film_person_roles_person_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_person_roles
    ADD CONSTRAINT film_person_roles_person_fk FOREIGN KEY (person_id) REFERENCES public.persons(id) ON DELETE CASCADE;


--
-- Name: film_tags film_tags_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_tags
    ADD CONSTRAINT film_tags_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: film_tags film_tags_tag_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.film_tags
    ADD CONSTRAINT film_tags_tag_fk FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: moderation_actions moderation_actions_complaint_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT moderation_actions_complaint_fk FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE SET NULL;


--
-- Name: moderation_actions moderation_actions_moderator_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_actions
    ADD CONSTRAINT moderation_actions_moderator_fk FOREIGN KEY (moderator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_versions review_versions_edited_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_versions
    ADD CONSTRAINT review_versions_edited_by_fk FOREIGN KEY (edited_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: review_versions review_versions_review_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_versions
    ADD CONSTRAINT review_versions_review_fk FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_current_version_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_current_version_fk FOREIGN KEY (current_version_id) REFERENCES public.review_versions(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_list_items user_list_items_film_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_list_items
    ADD CONSTRAINT user_list_items_film_fk FOREIGN KEY (film_id) REFERENCES public.films(id) ON DELETE CASCADE;


--
-- Name: user_list_items user_list_items_list_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_list_items
    ADD CONSTRAINT user_list_items_list_fk FOREIGN KEY (list_id) REFERENCES public.user_lists(id) ON DELETE CASCADE;


--
-- Name: user_list_items user_list_items_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_list_items
    ADD CONSTRAINT user_list_items_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_lists user_lists_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lists
    ADD CONSTRAINT user_lists_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

