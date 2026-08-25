FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application in development mode
CMD ["npm", "run", "dev"]
