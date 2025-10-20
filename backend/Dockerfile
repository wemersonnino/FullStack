FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Build admin panel
ENV NODE_ENV=production
RUN npm run build

# Expose port
EXPOSE 1337

# Start application
CMD ["npm", "run", "start"]
