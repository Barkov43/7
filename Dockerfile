FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# RUN apk add --no-cache sqlite
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]

