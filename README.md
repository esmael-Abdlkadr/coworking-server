# Coworking Space Management Server

This is the backend server for the Coworking Space Management application. It provides APIs for user authentication, booking management, event management, blog management, comment management, and more.

## Table of Contents

- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Project Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/coworking-server.git
   cd coworking-server
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary environment variables as described in the [Environment Variables](#environment-variables) section.

4. Start the server:
   ```sh
   pnpm run dev
   ```

## Environment Variables

The following environment variables need to be set in the `.env` file:

```properties
MONGO_URL=<your-mongodb-url>
SENTRY_DSN=<your-sentry-dsn>
REDIS_URL=<your-redis-url>
REDIS_HOST=<your-redis-host>
REDIS_PORT=<your-redis-port>
PORT=<your-server-port>
JWT_SECRET=<your-jwt-secret>
JWT_ACCESS_EXPIRES_IN=<jwt-access-token-expiry>
REFRESH_SECRET=<your-refresh-token-secret>
JWT_REFRESH_EXPIRES_IN=<jwt-refresh-token-expiry>
SMTP_HOST=<your-smtp-host>
SMTP_PORT=<your-smtp-port>
SMTP_EMAIL=<your-smtp-email>
SMTP_PASSWORD=<your-smtp-password>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
NODE_ENV=<your-node-environment>
BASE_URL=<your-base-url>
CLIENT_URL=<your-client-url>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
SESSION_SECRET=<your-session-secret>
```

## Available Scripts

- `pnpm run dev`: Starts the server in development mode using nodemon.
- `pnpm start`: Starts the server in production mode.

## API Documentation

The API documentation is available at `/api-docs` when the server is running locally. It provides detailed information about the available endpoints, request parameters, and responses.

To view the API documentation locally, start the server and navigate to:

```
http://localhost:5000/api-docs
```

The deployed API documentation is available at:

```
https://coworking-api-abys.onrender.com/api-docs/
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
