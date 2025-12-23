# Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build frontend
RUN pnpm build

# Setup Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY server/ ./server/

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./client/dist

# Environment variables
ENV PYTHONPATH=/app/server
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start command
CMD ["python", "server/main.py"]
