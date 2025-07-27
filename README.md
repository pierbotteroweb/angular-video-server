## Docker build USING docker-compose
...
docker-compose build (If the app is not already deployed on Docker)
docker-compose up

...

## Docker Build WITHOUT using docker-compose
```
docker build --tag angular-video-server .
docker run -p 1991:1991 angular-video-server
```

## Test
Open `http://localhost:1991/` in your browser.
