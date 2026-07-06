import fastify  from "fastify";
import { rateLimiter } from "./src/shared/middlewares/rateLimiter";


const businessApp=fastify({logger:true});


businessApp.get('/profile',{
    preHandler:[rateLimiter(5,1,'profile')]
},
async (request, reply) => {
    return { success: true, message: 'Funds transferred successfully.' };
  }
)

businessApp.get('/health', async (request, reply) => {
  return { status: 'System is operational' };
});

// Start the server
businessApp.listen({ port: 4000 }, () => {
  console.log('🏦 Business API running on http://localhost:4000');
});
