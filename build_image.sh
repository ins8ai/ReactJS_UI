docker build -t ins8-demo .
docker run --rm --env-file ./.env -p 8080:80 --name react-ins8 ins8-demo
