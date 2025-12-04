FROM alfg/nginx-rtmp:latest

RUN mkdir -p /var/www/html/hls

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 1935
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
