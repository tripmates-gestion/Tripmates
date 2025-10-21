export async function createUserRemote(
  email: string,
  password: string,
  role: 'user' | 'business',
  userName: string,
): Promise<void> {
  const response = await fetch('http://localhost:8080/auth/register', {
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
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al registrar el usuario');
  }
}


