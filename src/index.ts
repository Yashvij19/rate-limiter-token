
import Fastify from "fastify";
import { limiterRoutes } from "./server/routes/limiter";

const fastify=Fastify({
    logger:true
})

fastify.register(limiterRoutes,{prefix:"/v1/limiter"});

const startServer= async()=>{
    try{
        // Listen on port 3000. 
    // Using '0.0.0.0' instead of 'localhost' is required if you ever deploy this in a Docker container.

        await fastify.listen({port:3000, host:'0.0.0.0'});
        fastify.log.info("rate limiter service running on http://localhost:3000 ")


    }catch(err){
        fastify.log.error(`error starting rate limiter:- ${err}`);
        process.exit(1);
    }
}

startServer();