FROM node:20-alpine as bundler

# Install app dependencies
RUN mkdir -p /webapp
WORKDIR /webapp

ADD package* /webapp/
RUN npm install

ADD . /webapp/

ENV NODE_ENV production

CMD npm start