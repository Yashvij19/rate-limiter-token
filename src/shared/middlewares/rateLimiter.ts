import { FastifyRequest , FastifyReply } from "fastify";
import { error } from "node:console";

export const rateLimiter = (maxCapacity:number, refillRate:number , routeName:string)=>{
    return async (request:FastifyRequest , reply:FastifyReply)=>{
        try{
            const clientKey=`${request.ip}:${routeName}`;
            
            const limiterResponse= await fetch("http://localhost:3000/v1/limiter/checkRateLimit",{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    clientKey, 
                    maxCapacity,
                    refillRate
                }),
                signal:AbortSignal.timeout(200)  // wait max 100ms

            });

            const limitterData=await limiterResponse.json();
            if(!limitterData.allowed){
                return reply.code(429).send({
                    error:'TOO Many request',
                    message:`You are accessing the ${routeName} endpoint too fast.`
                })
            }
        }catch(error){
            request.log.error('Rate Limiter Check Failed - Failing Open');
        }
    }
}