# =============================================================
# Dockerfile — Backend (Node.js / Express)
#
# Docker ek containerization tool hai. Ye Dockerfile define
# karta hai ki Node.js application ka container kaise banega.
#
# Fayde:
#   - Application har machine par same environment mein chalegi
#   - "Works on my machine" problem solve ho jati hai
#   - Ek command se deploy ho jata hai: docker compose up -d
#
# Build command: docker build -t ctrlxurl-backend .
# =============================================================

# Step 1: Base image — Node.js 20 on lightweight Alpine Linux
FROM node:20-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package files first (layer caching optimization)
# If package.json hasn't changed, npm install won't re-run
COPY package*.json ./

# Step 4: Install only production dependencies (no devDependencies)
RUN npm install --only=production

# Step 5: Copy rest of the application source code
COPY . .

# Step 6: Remove .env file — environment variables will be passed
# at runtime via docker-compose.yml env_file, not baked into image
RUN rm -f .env

# Step 7: Expose port 3000 so Docker knows this container listens on it
EXPOSE 3000

# Step 8: Start the Node.js server
CMD ["node", "server.js"]
