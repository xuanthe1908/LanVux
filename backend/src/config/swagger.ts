import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from './index';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: config.swagger.title,
    version: config.swagger.version,
    description: config.swagger.description,
    contact: {
      name: 'API Support',
      email: 'support@elearning.com',
      url: 'https://elearning.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: config.swagger.serverUrl,
      description: 'Development server'
    },
    {
      url: 'https://api.elearning.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          role: {
            type: 'string',
            enum: ['student', 'teacher', 'admin'],
            description: 'User role'
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
            description: 'Profile picture URL'
          },
          bio: {
            type: 'string',
            description: 'User biography'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Course: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string',
            description: 'Course title'
          },
          description: {
            type: 'string',
            description: 'Course description'
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            description: 'Course thumbnail image URL'
          },
          teacherId: {
            type: 'string',
            format: 'uuid',
            description: 'Teacher ID'
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Course price'
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            description: 'Course status'
          },
          level: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
            description: 'Course difficulty level'
          },
          category: {
            type: 'string',
            description: 'Course category'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Lecture: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          courseId: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string',
            description: 'Lecture title'
          },
          description: {
            type: 'string',
            description: 'Lecture description'
          },
          contentType: {
            type: 'string',
            enum: ['video', 'document', 'quiz'],
            description: 'Type of lecture content'
          },
          contentUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL to lecture content'
          },
          orderIndex: {
            type: 'integer',
            minimum: 1,
            description: 'Order of lecture in course'
          },
          duration: {
            type: 'integer',
            minimum: 0,
            description: 'Lecture duration in seconds'
          },
          isPublished: {
            type: 'boolean',
            description: 'Whether lecture is published'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Assignment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          courseId: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string',
            description: 'Assignment title'
          },
          description: {
            type: 'string',
            description: 'Assignment description'
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Assignment due date'
          },
          maxPoints: {
            type: 'integer',
            minimum: 1,
            description: 'Maximum points for assignment'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Enrollment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          courseId: {
            type: 'string',
            format: 'uuid'
          },
          progress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Course completion progress percentage'
          },
          enrolledAt: {
            type: 'string',
            format: 'date-time'
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          lastAccessedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Message: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          senderId: {
            type: 'string',
            format: 'uuid'
          },
          recipientId: {
            type: 'string',
            format: 'uuid'
          },
          courseId: {
            type: 'string',
            format: 'uuid',
            nullable: true
          },
          subject: {
            type: 'string',
            description: 'Message subject'
          },
          content: {
            type: 'string',
            description: 'Message content'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          readAt: {
            type: 'string',
            format: 'date-time',
            nullable: true
          }
        }
      },
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          courseId: {
            type: 'string',
            format: 'uuid'
          },
          orderId: {
            type: 'string',
            description: 'Unique order identifier'
          },
          amount: {
            type: 'number',
            minimum: 0,
            description: 'Payment amount'
          },
          currency: {
            type: 'string',
            description: 'Payment currency'
          },
          paymentMethod: {
            type: 'string',
            description: 'Payment method used'
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
            description: 'Payment status'
          },
          transactionId: {
            type: 'string',
            description: 'Transaction ID from payment provider'
          },
          paymentDate: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string',
            description: 'Category name'
          },
          description: {
            type: 'string',
            description: 'Category description'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'fail']
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success']
          },
          message: {
            type: 'string',
            description: 'Success message'
          },
          data: {
            type: 'object',
            description: 'Response data'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Access denied',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Users',
      description: 'User management operations'
    },
    {
      name: 'Courses',
      description: 'Course management operations'
    },
    {
      name: 'Lectures',
      description: 'Lecture management operations'
    },
    {
      name: 'Assignments',
      description: 'Assignment management operations'
    },
    {
      name: 'Enrollments',
      description: 'Course enrollment operations'
    },
    {
      name: 'Payments',
      description: 'Payment processing operations'
    },
    {
      name: 'Messages',
      description: 'Internal messaging system'
    },
    {
      name: 'Categories',
      description: 'Course category operations'
    },
    {
      name: 'AI',
      description: 'AI-powered features'
    },
    {
      name: 'Upload',
      description: 'File upload operations'
    }
  ]
};

// Options for swagger-jsdoc
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .topbar-wrapper { display: none }
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: 'E-Learning API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

// Setup Swagger middleware
export const setupSwagger = (app: Express): void => {
  // Swagger JSON endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Alternative documentation endpoint
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  console.log(`📚 Swagger documentation available at: ${config.swagger.serverUrl}/api/docs`);
};

export default swaggerSpec;