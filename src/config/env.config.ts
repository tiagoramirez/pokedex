export const EnvConfiguration = () => ({
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'prod',
  mongodb: process.env.MONGODB_URL,
  getAllLimit: process.env.GET_ALL_POKEMONS_LIMIT || 10,
  seedLimit: process.env.SEED_LIMIT || 100,
  logEnabled: process.env.LOG_ENABLED || 0,
});
