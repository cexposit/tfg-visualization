# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY server.js /app/server.js
RUN npm config set unsafe-perm true
RUN npm install
EXPOSE 8181

# start app
CMD ["npm", "run", "start"]
