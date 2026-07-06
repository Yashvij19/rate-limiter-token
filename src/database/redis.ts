import Redis from "ioredis";

// we intialise the redis connection here
//this gurantees it is only created once when the app start


const redisClient = new Redis({

    host:process.env.REDIS_HOST || '127.0.0.1',
    port:Number(process.env.REDIS_PORT)|| 6379,
    // If you ever move this to AWS ElastiCache or a cloud provider, 
  // you would add your TLS and password configurations right here.
})

redisClient.on('connect',()=>{
    console.log("connected to redis server");
})

redisClient.on('error',(err)=>{
    console.error("redis connection error:- ", err);
})

export default redisClient;