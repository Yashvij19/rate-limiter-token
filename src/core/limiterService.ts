import fs from 'fs';
import path from 'path';
import redisClient from '../database/redis';
import { promises } from 'dns';

// 1. Tell TypeScript about our custom Redis command

declare module 'ioredis'{
    interface RedisCmd{
        checkTokenBucket(
            key:string,
            maxCapacity:string,
            refillRatePerSecond:string,
            currentTime:string,
            requestedToken:string,
            ttl:string
        ):Promise<[number, number]>; // Lua returns an array: [Allowed (1 or 0), RemainingTokens]
    }
    interface Redis extends RedisCmd {}
}


// 2. Read the Lua script from the disk synchronously on startup

const scriptPath=path.join(__dirname,'lua','tokenBucket.lua');
const luaScript=fs.readFileSync(scriptPath, 'utf8');

// 3. Define the command in ioredis (This handles the EVALSHA caching automatically)

redisClient.defineCommand('checkTokenBucket',{
    numberOfKeys:1,// We only pass 1 key: the user's bucket key
    lua:luaScript,
})


export interface RateLimitResponse{
    allowed:boolean;
    remainingTokens:number;
}


// 4. Create the  TypeScript function our Fastify routes will actually call
export interface RateLimitRequest{
    clientKey:string,
    maxCapacity:number,
    refillRate:number,
    requestedTokens?:number
}


export async function checkRateLimit(params:RateLimitRequest):Promise<RateLimitResponse>{
    const { 
    clientKey, 
    maxCapacity, 
    refillRate, 
    requestedTokens = 1 
  } = params;

  // We prefix the key so we don't accidentally overwrite other data in Redis
  const redisKey=`ratelimt:${clientKey}`;
  const currentTime=Date.now().toString();

  const ttl='3600'; // 1 hour


  // Execute the atomic Lua script
  const [allowedInt,remainingTokens]=await redisClient.checkTokenBucket(
    redisKey,
    maxCapacity.toString(),
    refillRate.toString(),
    currentTime,
    requestedTokens.toString(),
    ttl
  );

  return {
    allowed:allowedInt==1,
    remainingTokens,
  }

}