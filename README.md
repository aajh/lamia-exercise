## Usage

Tested with node v12 and Postgres 12.

First, create a `.env` file with variables:
```
NODE_ENV=development
DATABASE_URL=<Postgres production database url>
DEV_DATABASE_URL=<Postgres development database url>
```
To run the development server, only `DEV_DATABASE_URL` is required from the database URLs. `DATABASE_URL` is used as the production database and to run migrations for it. The format for the URL is `postgres://<username>:<password>@<host>:<port>/<database>`, for example, `postgres://postgres:postgres@localhost:5432/lamia_exercise_dev`.

To start the development server on http://localhost:8080, run:
```
npm install
npx db-migrate up
npm run build-dev
npm run start
```

If needed, run `npx db-migrate up:test` to populate the database with test data.
