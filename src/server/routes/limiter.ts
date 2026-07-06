import { FastifyInstance , FastifyPluginAsync } from "fastify";
import { checkRateLimit, RateLimitRequest } from "../../core/limiterService";



export const limiterRoutes:FastifyPluginAsync=async(fastify:FastifyInstance)=>{
    fastify.post<{Body:RateLimitRequest}>(
        '/checkRateLimit',
        {
            // Fastify Schema Validation: If the incoming request doesn't perfectly 
            // match this blueprint, Fastify automatically returns a 400 Bad Request.
            schema:{
                body:{
                    type:'object',
                    required:['clientKey', 'maxCapacity','refillRate'],
                    properties:{
                        clientKey:{
                            type:'string'
                        },
                        maxCapacity:{
                            type:'number',
                            minimum:1
                        },
                        refillRate:{
                            type:'number',
                            minimum:1
                        },
                        requestedTokens:{
                            type:'number',
                            minimum:1,
                            default:1
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            try{
                const params=request.body;
                const result=await checkRateLimit(params);

                return reply.code(200).send(result);

            }catch(error){
                request.log.error(error);
                return reply.code(500).send({error:'Internal server error'})
            }
        }
    );
};

