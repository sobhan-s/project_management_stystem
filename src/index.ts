import express, { response } from 'express';
import { config } from './config/envConfig.js';
import { logger } from './config/logger.config.js';
import { initializeDatabase } from './database/Migrate.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.route.js';
import projectRoutes from './routes/projects.route.js';
import projectMemberRoutes from './routes/projectMember.route.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config.js';

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/prMembers', projectMemberRoutes);

initializeDatabase();

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;
