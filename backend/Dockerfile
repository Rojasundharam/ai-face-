FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads/journal

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
