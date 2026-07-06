export interface tokenBucketParams{
    maxCapacity:number;  // the absolute maximum token the bucket can hold
    refillRatePerSecond:number; // how many token regenrate every second
    currentTokens:number; //how many token user currently has in the database
    lastRefillTime:number; // unix timestamp in millisconds of their last request
    currentTime:number; // current unix timestamp in millisconds

}

export interface TokenBucketResult{
    allowed:boolean; // true is request get passed
    newTokens:number; // te updated token balance to save in redis
}


export function calculateTokenBucket(params:tokenBucketParams):TokenBucketResult{
    
    const {
    maxCapacity,  // the absolute maximum token the bucket can hold
    refillRatePerSecond, // how many token regenrate every second
    currentTokens, //how many token user currently has in the database
    lastRefillTime, // unix timestamp in millisconds of their last request
    currentTime, // current unix timestamp in millisconds

}=params; // deconstruct the params here


// calculate exactly howmuch time has passed since they last viewed
const timeElapsed=(currentTime-lastRefillTime)/1000;

// calculate how many tokens they should have now
const tokenRecovered=timeElapsed*refillRatePerSecond;

let latestToken=currentTokens+tokenRecovered;

// we dont minus here the token we check that that much token should be there and its absoulte limit
// e.g. assume user comes after long ime and has token arround 1000 and our limit is 100 we set the token again as 100 never let out of the bucket capacity
// but if has oken under the limit like 50 then math.min(100,50) get 50 token

latestToken=Math.min(maxCapacity , latestToken);


if(latestToken>=1){
    return {
        allowed:true,
        newTokens:latestToken-1
    };
}else{
    return {
        allowed:false,
        newTokens:latestToken
    };

}

}