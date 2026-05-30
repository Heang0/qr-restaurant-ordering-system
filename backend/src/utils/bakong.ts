export async function verifyBakongTransaction(md5: string): Promise<boolean> {
  const isMock = process.env.BAKONG_MOCK === 'true';

  if (isMock) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[BAKONG] Simulated successful verification for md5: ${md5}`);
    return true;
  }

  const token = process.env.BAKONG_RELAY_TOKEN;
  if (!token) {
    throw new Error('BAKONG_TOKEN_MISSING');
  }

  try {
    const res = await fetch('https://api.bakongrelay.com/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ md5 })
    });

    const data = await res.json();
    
    console.log('BAKONG API Response Status:', res.status);
    console.log('BAKONG API Response Data:', JSON.stringify(data));
    
    // Bakong API usually returns 401 if token is invalid
    if (res.status === 401 || (data.responseCode === 1 && data.responseMessage?.includes('Unauthorized'))) {
      throw new Error('BAKONG_TOKEN_INVALID');
    }

    if (data.responseCode === 0) {
      return true; // Payment success
    }

    // Any other code implies payment not yet complete/found
    return false;
  } catch (err: any) {
    if (err.message === 'BAKONG_TOKEN_INVALID' || err.message === 'BAKONG_TOKEN_MISSING') {
      throw err;
    }
    // Network errors or other fetch failures
    console.error('[BAKONG] API Error:', err);
    return false;
  }
}
