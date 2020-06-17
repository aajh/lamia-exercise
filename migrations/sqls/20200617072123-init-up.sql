BEGIN;

CREATE TABLE places (
    id uuid PRIMARY KEY,
    title varchar(512) NOT NULL,
    description text NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    opening_hours_start char(5) NOT NULL,
    opening_hours_end char(5) NOT NULL
);

CREATE TABLE keywords (
    id uuid PRIMARY KEY,
    label varchar(128) NOT NULL
);

CREATE TABLE keyword_places (
    keyword_id uuid REFERENCES keywords(id) ON DELETE CASCADE,
    place_id uuid REFERENCES places(id) ON DELETE CASCADE,
    PRIMARY KEY (keyword_id, place_id)
);

CREATE INDEX index_keyword_places_place
ON keyword_places(place_id);

COMMIT;