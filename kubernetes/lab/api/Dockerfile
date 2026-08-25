# Use Node LTS slim/alpine
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (leverage cache)
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Default env (can be overridden)
ENV PORT=3000

# Run
CMD ["npm", "start"]
