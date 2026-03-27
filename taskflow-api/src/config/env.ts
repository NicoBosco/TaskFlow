import { z } from 'zod';
import dotenv from 'dotenv';

// Se cargan las variables de entorno correspondientes antes de nada
const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = nodeEnv === 'test' ? '.env.test' : '.env';

const result = dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001').transform((v) => parseInt(v, 10)),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL debe ser una URL válida' }),
  JWT_SECRET: z.string().min(10, { message: 'JWT_SECRET debe tener al menos 10 caracteres' }),
  FRONTEND_URL: z.string().url().optional().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  if (nodeEnv === 'test' && result.error) {
    console.error('❌ Error: No se encontró el archivo .env.test');
    console.error('👉 Por favor, copia .env.test.example a .env.test y ajusta los valores.');
  } else {
    console.error('\n❌ ERROR DE CONFIGURACIÓN (Variables de entorno):');
    _env.error.issues.forEach((issue) => {
      console.error(`- Campo [${issue.path.join('.')}]: ${issue.message}`);
    });
    console.error('\n👉 Por favor, revisa tu archivo .env y asegúrate de completar todos los campos requeridos.\n');
  }
  process.exit(1);
}

export const env = _env.data;
