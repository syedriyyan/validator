--
-- PostgreSQL database dump
--

\restrict NzsJU8pDGbouc4QPQhwfEdWXk4oWpI0hF73IEtfIHeMt42jXBp6Q2xTegvC6KIy

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-24 12:09:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16387)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16435)
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    uploaded_by uuid,
    filename text NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT batches_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'done'::text])))
);


ALTER TABLE public.batches OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16450)
-- Name: email_validations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_validations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    batch_id uuid,
    valid_syntax boolean,
    valid_domain boolean,
    smtp_success boolean,
    is_disposable boolean,
    is_role_email boolean,
    is_blacklisted boolean,
    fraud_score integer,
    risk_level text,
    breach_sources text[],
    checked_at timestamp with time zone DEFAULT now(),
    CONSTRAINT email_validations_fraud_score_check CHECK (((fraud_score >= 0) AND (fraud_score <= 100))),
    CONSTRAINT email_validations_risk_level_check CHECK ((risk_level = ANY (ARRAY['valid'::text, 'risky'::text, 'invalid'::text])))
);


ALTER TABLE public.email_validations OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16424)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'user'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4953 (class 0 OID 16435)
-- Dependencies: 219
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, uploaded_by, filename, status, created_at) FROM stdin;
\.


--
-- TOC entry 4954 (class 0 OID 16450)
-- Dependencies: 220
-- Data for Name: email_validations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_validations (id, email, batch_id, valid_syntax, valid_domain, smtp_success, is_disposable, is_role_email, is_blacklisted, fraud_score, risk_level, breach_sources, checked_at) FROM stdin;
\.


--
-- TOC entry 4952 (class 0 OID 16424)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role) FROM stdin;
\.


--
-- TOC entry 4800 (class 2606 OID 16444)
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 16460)
-- Name: email_validations email_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_validations
    ADD CONSTRAINT email_validations_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 16434)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4798 (class 2606 OID 16432)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 1259 OID 16467)
-- Name: idx_batches_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batches_user ON public.batches USING btree (uploaded_by);


--
-- TOC entry 4804 (class 1259 OID 16466)
-- Name: idx_email_validations_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_validations_email ON public.email_validations USING btree (email);


--
-- TOC entry 4805 (class 2606 OID 16445)
-- Name: batches batches_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4806 (class 2606 OID 16461)
-- Name: email_validations email_validations_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_validations
    ADD CONSTRAINT email_validations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;


-- Completed on 2025-09-24 12:09:07

--
-- PostgreSQL database dump complete
--

\unrestrict NzsJU8pDGbouc4QPQhwfEdWXk4oWpI0hF73IEtfIHeMt42jXBp6Q2xTegvC6KIy

