import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";

export const setupSwagger = (app: Express) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Multivendor E-commerce API",
        version: "1.0.0",
        description: "Backend API for multivendor e-commerce system with customers and vendors",
      },
      servers: [
        {
          // url: "https://numdi1234.onrender.com/api/v1",
          url: "http://localhost:5000/api/v1",
          description: "Live server",
        },
      ],
      tags: [
        {
          name: "Users",
          description: "User management endpoints",
        },
        {
          name: "Products",
          description: "Product management APIs (Admin & Vendor)",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: [
      "./src/app/modules/**/*.ts",
      "./dist/app/modules/**/*.js",
    ],
    // route files with Swagger comments
  };


  const swaggerSpec = swaggerJSDoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      tagsSorter: 'none',
      operationsSorter: 'none',
    }
  }));
  console.log("📘 Swagger docs available at: http://localhost:5000/docs");
};
