# Use official stable Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Railway injects PORT dynamically, so do NOT hardcode here
ENV NODE_ENV=production

RUN ls -R /app   # TEMPORARY DEBUG

# Expose the runtime port (Railway maps EXPOSE to process.env.PORT)
EXPOSE 80

# Start the server
CMD ["node", "server.js"]
