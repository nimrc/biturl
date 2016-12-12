FROM ubuntu:14.04

COPY . /var/www/biturl

RUN apt-get update

RUN apt-get install curl g++ -y

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

RUN apt-get install nodejs redis -y

WORKDIR /var/www/biturl

RUN /usr/bin/npm install 

CMD ["/usr/bin/node", "/var/www/biturl/app.js"]

EXPOSE 4000
