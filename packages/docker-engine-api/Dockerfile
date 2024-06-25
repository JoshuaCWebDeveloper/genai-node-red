FROM alpine:3.19

RUN apk --update add socat

EXPOSE 2375

ENTRYPOINT ["socat"]

CMD ["TCP-LISTEN:2375,fork", "UNIX-CONNECT:/var/run/docker.sock"]
