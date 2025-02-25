import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Msauthn-Api-Doc',
      version: '1.0.0',
      description: 'API documentation for msauthn',
    },
    tags: [
      { name: 'Authentication', description: 'Endpoints for login, logout, registration' },
      { name: 'OAuth2', description: 'Endpoints for OAuth 2.0' },
      { name: 'Password Reset', description: 'Endpoints for password reset and recovery' },
    ],
  },
  apis: ['./docs/**/*.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };
