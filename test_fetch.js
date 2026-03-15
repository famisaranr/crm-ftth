const loginUrl = 'http://localhost:3001/api/v1/subscriber-auth/login';
const profileUrl = 'http://localhost:3001/api/v1/portal/me';

fetch(loginUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ account_number: 'ACC-2026-TEST', password: 'SubscriberPass123!' })
})
.then(async res => {
  const data = await res.json().catch(() => null);
  console.log('Login Status:', res.status);
  
  if (data?.access_token) {
    const token = data.access_token;
    console.log('Got token, fetching profile...');
    
    // Fetch profile
    const profileRes = await fetch(profileUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json().catch(() => null);
    console.log('Profile Status:', profileRes.status);
    console.log('Profile Data:', profileData);
  } else {
    console.log('No token in response:', data);
  }
})
.catch(err => console.error('Fetch Failed:', err.message));
