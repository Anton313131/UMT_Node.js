const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Noticeboard API',
      version: '1.0.0',
      description: 'REST API for the Noticeboard announcements board',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Category: {
          type: 'string',
          enum: ['sale', 'rent', 'buy', 'service', 'other'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            name: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', minLength: 4, maxLength: 30 },
            name: { type: 'string', maxLength: 50 },
            password: { type: 'string', minLength: 6, maxLength: 100 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Announcement: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { $ref: '#/components/schemas/Category' },
            contactInfo: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            userId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AnnouncementInput: {
          type: 'object',
          required: ['title', 'description', 'price', 'category', 'contactInfo'],
          properties: {
            title: { type: 'string', minLength: 5, maxLength: 100 },
            description: { type: 'string', minLength: 10, maxLength: 500 },
            price: { type: 'number', minimum: 0 },
            category: { $ref: '#/components/schemas/Category' },
            contactInfo: { type: 'string', minLength: 5, maxLength: 100 },
          },
        },
        AnnouncementFormInput: {
          allOf: [
            { $ref: '#/components/schemas/AnnouncementInput' },
            {
              type: 'object',
              properties: {
                image: { type: 'string', format: 'binary' },
              },
            },
          ],
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        AnnouncementList: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Announcement' } },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
