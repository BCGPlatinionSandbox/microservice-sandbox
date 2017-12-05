FROM nginx:stable-alpine

MAINTAINER Regis Martin - Philippe Savary / BCGPlatinion  MIT Licence ©2017


RUN rm /etc/nginx/conf.d/default.conf
ADD reverse.conf /etc/nginx/conf.d/





CMD ["nginx","-g", "daemon off;"]
