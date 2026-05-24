/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConfigException } from '../exception/config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    database: {
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: Number(process.env.DATABASE_PORT),
      url: process.env.DATABASE_URL,
      username: process.env.DATABASE_USERNAME,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `Invalid application configuration: ${result.error.message}`,
  );
};
