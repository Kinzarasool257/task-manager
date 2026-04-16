async function testSync() {
  try {
    const response = await fetch('http://localhost:4000/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        externalId: "cm1234567890guest",
        email: "guest@dailytm.app",
        name: "Guest User",
        image: null,
        preferences: {
          industry: "Marketing",
          role: "Student",
          country: "Canada",
          bio: "test"
        }
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Success:', data);
    } else {
      console.error('Error Status:', response.status);
      console.error('Error Data:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSync();
