FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
# Inside the container "api" resolves via Docker Compose networking, not 127.0.0.1
RUN sed -i 's#127.0.0.1:8080#api:8080#' /etc/nginx/conf.d/default.conf
EXPOSE 80
