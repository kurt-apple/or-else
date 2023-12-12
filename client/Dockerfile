FROM node:lts-hydrogen
RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -d
EXPOSE 8080
CMD [ "http-server", "dist/spa" ]