export async function createUserRemote(
  email: string,
  password: string,
  role: 'user' | 'business',
  userName: string,
) {
  const response = await fetch('http://localhost:8080/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      role: role.toUpperCase(),
      userName,
    })
  });
  
   await response.json();
}


