FROM node:alpine
WORKDIR "/app"
COPY ./package*.json .
RUN npm install
RUN apk add --no-cache ffmpeg
COPY . .
RUN chmod +x ./start.sh
RUN npx prisma generate --no-engine
CMD ["sh", "./start.sh"]