export const EnvConfiguration = () => ({
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'prod',
  mongodb: process.env.MONGODB_URL,
  getAllLimit: process.env.GET_ALL_POKEMONS_LIMIT || 10,
  logEnabled: process.env.LOG_ENABLED === 'true' ? true : false,
  maxPokemons: process.env.MAX_POKEMONS || 1010,
});
