<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" style='width:6rem' alt="Nest Logo" />
  &emsp;
  &emsp;
  &emsp;
  <img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Flogos-download.com%2Fwp-content%2Fuploads%2F2016%2F09%2FDocker_logo.png&f=1&nofb=1&ipt=4162a311f9a5972d32f162533f73cc421d6c4f716446448d9cff4fc70cba9fbf&ipo=images" style='width:6rem' alt="Docker Logo" />
</p>

# Developer

1. Clone repository
2. Installed nest cli

```
npm i -g @nestjs/cli
```

3. Download dependencies:

```
yarn
```

4. Start database (with docker)

```
docker-compose up -d
```

5. Clone `.env.template` and rename to `.env`
6. Fill environment variables in `.env`
7. Start app in dev mode

```
yarn start:dev
```

8. Restore database with seed <sup>1*</sup>

```
http://localhost:3000/api/v1/seed
```

# Production

1. Clone `.env.template` and rename to `.env.prod`
2. Fill environment variables in `.env.prod`
3. Build and run image

```
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Technologies
- Nest.js
- Node.js
- MongoDB
- Docker
- HTML + CSS
- Swagger
---
1*: In the `.env` file the variables that starts with ___POKEMON_REGION_PAGE___ have to be filled with a website that contains the ___global pokemon number___ in the ___first column of each table row___. It is going to skip the first and the last table of the page (due to the example pages in the `.env_template` file).