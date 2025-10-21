export async function createUserRemote(
  email: string,
  password: string,
  role: 'user' | 'business',
  userName: string,
): Promise<void> {
  const requestBody = {
    email,
    password: '[REDACTED]', // No exponer la contraseña en los logs
    role: role.toUpperCase(),
    userName,
  };

  console.log('[User Creation] Sending request to: POST http://localhost:8080/auth/register');
  console.log('[User Creation] Request body:', {
    ...requestBody,
    password: '[REDACTED]' // Aseguramos que la contraseña no se muestre
  });

  try {
    const response = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...requestBody,
        password // La contraseña real solo se envía en la petición
      })
    });
    
    const responseData = await response.text();
    
    if (!response.ok) {
      console.error('[User Creation] Error response:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      throw new Error(responseData || 'Error al registrar el usuario');
    }
    
    console.log('[User Creation] Success! Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData || 'No data returned'
    });
    
  } catch (error) {
    console.error('[User Creation] Error during user creation:', error);
    throw error; // Relanzamos el error para que pueda ser manejado por el llamador
  }
}


