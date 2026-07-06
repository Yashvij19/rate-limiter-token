
-- Inputs mapped from Redis call
local key=KEYS[1]

local max_capacity=tonumber(ARGV[1])
local refill_rate=tonumber(ARGV[2])
local current_time=tonumber(ARGV[3])
local requested_token=tonumber(ARGV[4])
local ttl=tonumber(ARGV[5])


-- Step 1: Fetch current bucket values from Redis Hash

local bucket=redis.call("HMGET",key ,'tokens', 'last_updated')

local current_tokens=tonumber(bucket[1])
local last_updated=tonumber(bucket[2])

-- Step 2: Initialize bucket if it does not exist (New user or TTL expired)

if not current_tokens or not last_updated then
    current_tokens=max_capacity
    last_updated=current_time
end


-- Step 3: Calculate lazy-evaluation tokens to add
local time_elapsed=(current_time-last_updated)/1000;
if time_elapsed<0 then
    time_elapsed=0;
end

local token_to_add=time_elapsed*refill_rate;
local new_tokens=current_tokens+token_to_add

if new_tokens>max_capacity then
    new_tokens=max_capacity
end


-- Step 4: Decision evaluation
local allowed=0;

if new_tokens>=requested_token then
    allowed=1
    new_tokens=new_tokens-requested_token
    last_updated=current_time
end


-- Step 5: Save updated values back to Redis and reset the TTL timer
redis.call('HMSET' ,key ,'tokens', new_tokens , 'last_updated',last_updated )
redis.call('EXPIRE' ,key ,ttl)


-- Return result to Fastify: [Allowed Status (1 or 0), Remaining Tokens]
return {allowed, new_tokens}