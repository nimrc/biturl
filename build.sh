#!/usr/bin/bash
pip install backports.ssl_match_hostname==3.5.0.1 docker-compose==1.9.0
docker build -t biturl .
docker-compose up

