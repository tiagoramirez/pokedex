export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB_URL,
  port: process.env.PORT || 3000,
  defaultLimit: process.env.DEFAULT_LIMIT || 10,
  maxPokemonSeed: process.env.MAX_POKEMON_SEED || 100,
});
