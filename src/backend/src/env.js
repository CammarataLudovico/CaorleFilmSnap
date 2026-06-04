require('dotenv').config();
const { z } = require('zod');

const env = z
  .object({
    PORT: z.coerce.number().default(3001),
    ADMIN_API_KEY: z.string().min(32),
    CORS_ORIGINS: z.string().optional(),
    RATE_LIMIT_MAX: z.coerce.number().default(300),
    UPLOAD_RATE_LIMIT_MAX: z.coerce.number().default(30),
    ADMIN_RATE_LIMIT_MAX: z.coerce.number().default(120),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  })
  .parse(process.env);

module.exports = env;
