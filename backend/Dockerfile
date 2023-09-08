FROM golang:1.21

WORKDIR /apps

COPY . .

RUN go get

RUN ls

RUN go run github.com/steebchen/prisma-client-go db push

RUN ls

ENV LISTEN_ON=0.0.0.0

ENV PORT=8080

EXPOSE 8080

RUN go build -o bin .

ENTRYPOINT [ "/apps/bin" ]
