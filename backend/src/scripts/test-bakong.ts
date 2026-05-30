import 'dotenv/config';

async function testBakong() {
  const token = process.env.BAKONG_TOKEN;
  console.log('Token exists:', !!token);
  
  try {
    const res = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ md5: 'test_md5_hash_123456' })
    });
    
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testBakong();
