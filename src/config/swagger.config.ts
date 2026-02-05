import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Mangement System API',
      version: '1.0.0',
      description: 'API documentation for Project Mangement',
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
  tags: [
    { name: 'Auth', description: 'Authentication APIs' },
    { name: 'Users', description: 'User Access APIs' },
    { name: 'Project', description: 'Creation of Project APIS' },
    {
      name: 'Project Member Mangement',
      description: 'Mange the project members APIS',
    },
  ],
});
