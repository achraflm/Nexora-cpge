FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build
ARG SERVICE
ENV SERVICE=$SERVICE
USER node
CMD ["sh", "-c", "exec node $SERVICE/dist/main.js"]
