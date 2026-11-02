# Intro to Backend: Node.js, Express, and MongoDB

A small REST API with user registration, login, logout, and post CRUD (create, read, update, delete). It is built with Node.js, Express, MongoDB Atlas, and Mongoose, and organized into models, controllers, and routes.

## Credit

This project follows the freeCodeCamp.org course [Intro to Backend Web Development – Node.js & Express Tutorial for Beginners](https://www.youtube.com/watch?v=KOutPbKc9UM) by Shivani, and her source code in [NewSmoke38/intro-to-backend](https://github.com/NewSmoke38/intro-to-backend). The endpoints and fields match the tutorial. The small corrections are listed in [Changes from the tutorial](#changes-from-the-tutorial).

## Prerequisites

- Node.js 20.19 or newer, with npm (tested with Node.js 22)
- Git
- A MongoDB Atlas account with a free cluster
- Postman desktop

## Setup

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/xOAviOx/web-dev.git
   cd web-dev
   npm install
   ```

2. Create your own `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

3. In MongoDB Atlas:
   - Under **Database Access**, create a database user with a password.
   - Under **Network Access**, add your IP address. If your IP keeps changing, add `0.0.0.0/0` for development only.
   - Click **Connect** on your cluster, choose the Node.js driver, and copy the connection string.

4. Paste the connection string into `.env` as `MONGODB_URI`. Replace `<username>` and `<password>` with the database user's details. If the password contains characters such as `@`, `:`, `/`, or `#`, URL-encode them.

## Environment variables

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `4000` | Port the server listens on |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority` | Atlas connection string. Keep it secret. |

`.env` is listed in `.gitignore`, so it is never committed. The data is stored in a database named `intro-to-backend`, set in `backend/src/config/constants.js`.

## Run

| Command | What it does |
|---|---|
| `npm run dev` | Starts the server with nodemon, which restarts it when you save a file |
| `npm start` | Starts the server with plain Node.js |

When the server starts correctly, the terminal shows:

```
MongoDB connected: intro-to-backend
Server is running at http://localhost:4000
```

Open `http://localhost:4000/` in a browser to see `{"message":"API is running"}`.

## Project structure

```
backend/src/
  index.js                          loads .env, connects to MongoDB, then starts the server
  app.js                            creates the Express app, parses JSON, mounts routes, 404 and error handlers
  config/constants.js               database name
  config/database.js                connects Mongoose to MongoDB Atlas
  models/user.model.js              User schema, password hashing, comparePassword
  models/post.model.js              Post schema
  controllers/user.controller.js    register, login, logout
  controllers/post.controller.js    create, read, update, delete posts
  routes/user.route.js              URLs under /api/v1/users
  routes/post.route.js              URLs under /api/v1/posts
postman/
  intro-to-backend.postman_collection.json
.env.example                        placeholder environment variables
```

## Request flow

Postman → route → controller → model → MongoDB → response

For example, `POST /api/v1/users/register`:

1. Postman sends a JSON body with `username`, `email`, and `password`.
2. In `app.js`, `express.json()` turns the body into `req.body`, and `app.use("/api/v1/users", userRouter)` passes the request to the user router.
3. In `user.route.js`, `router.route("/register").post(registerUser)` picks the controller function.
4. In `user.controller.js`, `registerUser` checks the fields, looks for an existing user, and calls `User.create()`.
5. In `user.model.js`, Mongoose validates the fields, and the `pre("save")` hook replaces the password with a bcrypt hash.
6. MongoDB Atlas stores the document in the `users` collection.
7. The controller sends status `201` with the user's `id`, `username`, and `email`. The password is never sent back.

## API endpoints

Base URL: `http://localhost:4000`

### Users

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/v1/users/register` | `username`, `email`, `password` | 201 | 400 missing or invalid fields, 409 email or username taken |
| POST | `/api/v1/users/login` | `email`, `password` | 200 | 400 missing fields, 401 wrong email or password |
| POST | `/api/v1/users/logout` | `email` | 200 | 400 missing email, 404 no user with that email |

### Posts

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/v1/posts/create` | `name`, `description`, `age` | 201 | 400 missing or invalid fields |
| GET | `/api/v1/posts/getPosts` | none | 200 | |
| PATCH | `/api/v1/posts/update/:id` | any of `name`, `description`, `age` | 200 | 400 invalid id or fields, 404 post not found |
| DELETE | `/api/v1/posts/delete/:id` | none | 200 | 400 invalid id, 404 post not found |

Every endpoint returns `500 {"message": "Internal server error"}` if the database fails. Unknown URLs return `404 {"message": "Route not found"}`, and a body that is not valid JSON returns `400`.

Validation rules:

- `username`: required, at most 30 characters, unique, saved in lowercase
- `email`: required, must look like `name@example.com`, unique, saved in lowercase
- `password`: required, 6 to 50 characters, saved only as a bcrypt hash
- `name` and `description`: required text
- `age`: required number from 1 to 150

Example request bodies:

```json
{ "username": "avi", "email": "avi@example.com", "password": "secret123" }
```

```json
{ "name": "My first post", "description": "Created from Postman", "age": 21 }
```

## What login and logout do

- **Login** finds the user by email and uses bcrypt to compare the password with the stored hash. If they match, it returns the user's `id`, `username`, and `email`. It does not create a session or a token, so the server does not remember who is logged in.
- **Logout** checks that a user with the given email exists and returns `"Logout successful"`. Nothing changes on the server, because there is no session to end.
- **Post routes are not protected.** Anyone who can reach the server can create, update, or delete posts without logging in.

This matches the tutorial. A real application would give the user a session cookie or a JSON Web Token (JWT) at login, check it on protected routes, and clear or invalidate it at logout.

## Testing with Postman

1. Start the server with `npm run dev`.
2. In Postman desktop, click **Import** and choose `postman/intro-to-backend.postman_collection.json`.
3. Open the collection's **Variables** tab and check that `baseUrl` is `http://localhost:4000`.
4. Send the requests from top to bottom, or click **Run** on the collection to send all 19 requests and check their tests.

Notes:

- Each request's description lists its expected status code, and its test script checks it.
- **Register user** creates a new username and email every time, so the collection can be run again without a 409 error.
- **Create post** saves the new post's `_id` in the `postId` variable, which the update and delete requests use.
- To see the stored data, open your cluster in Atlas, click **Browse Collections**, and open `intro-to-backend`. MongoDB Compass works too, with the same connection string.

## Changes from the tutorial

- Mongoose 9 no longer passes `next()` to `pre` middleware, so the password hook is a plain `async` function.
- Updates use `returnDocument: "after"` instead of the deprecated `new: true`, and `runValidators: true` so the schema rules also apply to updates.
- Invalid ids and invalid fields return `400`, and missing posts return `404`, instead of `500`.
- A duplicate email or username returns `409`. Login returns the same `401` message for an unknown email and for a wrong password.
- User fields must be text, which blocks query tricks such as `{"$gt": ""}` in place of an email.
- Error responses no longer include internal error details, and the server no longer prints `MONGODB_URI` to the console.
- Unknown routes return JSON `404`, and invalid JSON returns `400` instead of an HTML error page.
- `nodemon` is a development dependency, and `DB_NAME` is passed to Mongoose as `dbName`.

## Dependencies

| Package | Why it is needed |
|---|---|
| `express` | Web framework: routes, middleware, and JSON body parsing |
| `mongoose` | Schemas and models for MongoDB, plus validation |
| `bcrypt` | Hashes passwords and compares them at login |
| `dotenv` | Loads variables from `.env` into `process.env` |
| `nodemon` (development only) | Restarts the server when files change |
