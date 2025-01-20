# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Fix to Prisma known failure: https://github.com/prisma/prisma/issues/19729
RUN set -ex; \
    apk update; \
    apk add --no-cache \
    openssl

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate prisma code
RUN npm run generate

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
