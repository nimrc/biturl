FROM node

COPY . /var/www/biturl

WORKDIR /var/www/biturl

RUN /usr/local/bin/npm install

CMD ["/usr/local/bin/node", "/var/www/biturl/app.js"]

EXPOSE 4000

