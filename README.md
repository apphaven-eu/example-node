# Node.js Express with PostgreSQL on AppHaven

Deploy a Node.js Express application with managed PostgreSQL on [AppHaven](https://apphaven.eu). This example uses Express 5, the `pg` driver, and parameterised SQL for a server-rendered todo list with no frontend build step.

Add, list, and delete tasks. Data persists across app restarts in PostgreSQL.
The repository includes the application, a `Dockerfile`, and an `apphaven.yaml` manifest.

## Stack

- Node.js 22, ES modules
- Express 5, server-rendered HTML, no client-side framework
- `pg` driver, parameterised SQL, no ORM
- PostgreSQL 17
- Container base image `node:22-alpine`, running as the non-root `node` user

## Run it locally

You need Docker for PostgreSQL and Node.js 22 and npm. Clone this repository first:

```sh
git clone https://github.com/apphaven-eu/example-node.git
cd example-node
```

1. Start PostgreSQL for development:

   ```
   docker run -d --name todo-pg -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=devpassword postgres:17
   ```

2. Point the application at it:

   ```
   export DATABASE_URL="postgres://postgres:devpassword@127.0.0.1:5432/postgres"
   ```

3. Install dependencies and start the server:

   ```
   npm ci
   npm start
   ```

The application listens on http://localhost:8080/. The `todos` table is created at startup if it
does not exist. Set `PORT` to use a different port.

## Deploy Express on AppHaven

1. Fork this repository, or push a copy to a Git host reachable over HTTPS.
2. Open the [AppHaven console](https://console.apphaven.eu/), select a project, and create an app.
3. In **Source**, connect your repository and select the production branch (usually `main`).
4. Click **Deploy** and select that branch. Follow the build logs, then open the deployment URL.

You need an AppHaven account with console access. See the
[getting started guide](https://docs.apphaven.eu/getting-started) for account and repository setup.

`apphaven.yaml` declares two services: the `web` container built from the `Dockerfile`, and a
managed `db` service running PostgreSQL 17. `DATABASE_URL` is injected at deploy time from
`${service.db.url}`, so production database credentials stay out of source control.

### Access and shared data

Apps are **private by default**: only members of the AppHaven project can open them.
This example has one shared todo list; it does not separate tasks by user.
For a public demo, a project administrator can select **Public** in the app's **Security**
section and redeploy. Anyone who can reach the app can add and delete tasks, so use demo data.
Production can be public while previews remain private. See [access control](https://docs.apphaven.eu/access).

### Preview a change

Push a new branch and deploy it from the console. AppHaven creates a preview with its own URL,
storage, and database, separate from production. Add a task in the preview, redeploy that branch,
and check that the task is still there before merging the change.

### Verify the deployment

Open the app, add a task, refresh, and delete it. The manifest waits for PostgreSQL to be healthy
before starting the web container. `/healthz` is a process liveness endpoint; it does not query
the database. The container's healthcheck runs internally, so it needs no public-path exemption.

The schema uses `CREATE TABLE IF NOT EXISTS` for the initial table. When extending the app,
use versioned migrations for changes to existing columns and tables.

## AppHaven

When deployed, AppHaven runs this example: it builds the image from the `Dockerfile` and hosts the container. The
PostgreSQL database is a managed service declared in `apphaven.yaml`, created with the deployment
and handed to the app as a connection URL.

- Platform: https://apphaven.eu
- Managed PostgreSQL: https://docs.apphaven.eu/services/postgres
- Manifest reference: https://docs.apphaven.eu/reference/manifest

## Related examples

[Go](https://github.com/apphaven-eu/example-go), [Spring Boot](https://github.com/apphaven-eu/example-java), [Next.js](https://github.com/apphaven-eu/example-nextjs), [PHP](https://github.com/apphaven-eu/example-php), [FastAPI](https://github.com/apphaven-eu/example-python).

## License

[MIT](LICENSE).
