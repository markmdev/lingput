FROM node:alpine
WORKDIR "/app"
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY ./package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]