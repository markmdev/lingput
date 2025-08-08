FROM node:alpine
WORKDIR "/app"
COPY ./package*.json .
RUN npm install
RUN apk add --no-cache ffmpeg
COPY . .
RUN npx prisma generate --no-engine
CMD ["npm", "run", "dev"]