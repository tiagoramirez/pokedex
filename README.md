<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Developer mode

1. Clone repository
2. Exec:
```
yarn install
```
3. Installed Nest CLI
```
npm i -g @nestjs/cli
```
4. Start database (docker)
```
docker-compose up -d
```
5. Clone ```.env.template``` and rename to ```.env```
6. Fill environment variables in ```.env```
7. Start app in dev mode
```
yarn start:dev 
```
8. Restore database with seed

```
http://localhost:3000/api/v1/seed
```

## Technologies
* Nest
* Node
* MongoDB
* Docker
* HTML + CSS