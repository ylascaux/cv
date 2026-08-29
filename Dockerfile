FROM mcr.microsoft.com/playwright:v1.62.1-noble AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY astro.config.mjs tsconfig.json ./
COPY content ./content
COPY scripts ./scripts
COPY site ./site
RUN npm run build

FROM nginx:1.31.4-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget --quiet --spider http://127.0.0.1/ || exit 1
