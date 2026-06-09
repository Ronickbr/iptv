FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p /app/.next
RUN mkdir -p /app/node_modules

# Build Next.js app
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start both Next.js and API server
CMD ["npm", "run", "dev"]