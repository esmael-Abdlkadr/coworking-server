FROM node:20

WORKDIR /usr/src/app

# Copy package manager files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5000

# Start the application
CMD ["pnpm", "dev"]
