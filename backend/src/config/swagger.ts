import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Smart Road Estimator API',
            version: '1.0.0',
            description:
                'Production-ready REST API for AI-based road damage detection and cost estimation. Supports user auth, project management, image upload, AI analysis, cost estimation, BOQ export, and rate management.',
            contact: {
                name: 'NHAI Engineering Division',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'API base path',
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
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
