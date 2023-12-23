FROM node:lts-hydrogen
RUN yarn global add http-server
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn run build -m pwa -d
EXPOSE 8080
CMD [ "http-server", "dist/pwa" ]
