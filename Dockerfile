ARG REGISTRY=uhub.service.ucloud.cn/myblog_docker

# Stage 1: Build
FROM ${REGISTRY}/node:24-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM ${REGISTRY}/nginx:alpine
COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
