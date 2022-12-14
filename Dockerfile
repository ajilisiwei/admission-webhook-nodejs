FROM node:12.18.2
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm install
COPY ./app .
EXPOSE 8443
USER 1000:1000
CMD [ "node", "app.js" ]