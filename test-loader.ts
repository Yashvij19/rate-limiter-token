// test-load.ts

// to run:- npx tsx test-load.ts

const runLoadTest = async () => {
  const url = 'http://localhost:3000/v1/limiter/checkRateLimit';
  const payload = {
    clientKey: 'hacker_99',
    maxCapacity: 10,
    refillRate: 1, // Refills so slowly it won't interfere with our instant test
  };

  console.log('🔥 Firing 50 concurrent requests in a single millisecond...');

  // Create an array of 50 HTTP requests
  const requests = Array.from({ length: 50 }).map(() =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => res.json())
  );

  // Promise.all fires them all at the exact same time
  const results = await Promise.all(requests);

  // Tally up the results
  const allowedCount = results.filter((r) => r.allowed === true).length;
  const deniedCount = results.filter((r) => r.allowed === false).length;

  console.log('=================================');
  console.log(`✅ Allowed Requests: ${allowedCount} (Should be exactly 10)`);
  console.log(`❌ Denied Requests:  ${deniedCount} (Should be exactly 40)`);
  console.log('=================================');
  
  if (allowedCount === 10) {
    console.log('🛡️  SUCCESS: The Lua Script successfully prevented a race condition!');
  } else {
    console.log('⚠️  FAILURE: Race condition detected. Tokens were double-spent.');
  }
};

runLoadTest();