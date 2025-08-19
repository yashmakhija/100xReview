import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '100x Dashboard API Documentation',
      version: '1.0.0',
      description: 'API documentation for the 100x Dashboard backend',
      contact: {
        name: 'Support',
        email: 'contact@100xdevs.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API base URL',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token with "Bearer " prefix',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'HTTP-only cookie containing the refresh token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error message' },
            code: { type: 'string', example: 'ERROR_CODE' },
            details: { type: 'object' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', example: 'USER' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
            accessToken: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            number: { type: 'string', example: '1234567890' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          },
        },
        CreateUserResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User created successfully' },
            user: { $ref: '#/components/schemas/UserResponse' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password', example: 'oldPassword123' },
            newPassword: { type: 'string', format: 'password', example: 'newPassword123' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'number', example: 1 },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Access denied: insufficient permissions',
                code: 'FORBIDDEN',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation Error - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: [
                  {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'undefined',
                    path: ['email'],
                    message: 'Email is required',
                  },
                ],
              },
            },
          },
        },
        NotFoundError: {
          description: 'Not Found - Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Resource not found',
                code: 'RESOURCE_NOT_FOUND',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);

// Paths documentation - to be added to route files using JSDoc
export const swaggerPaths = {
  // Add paths here if not using JSDoc annotations
};
