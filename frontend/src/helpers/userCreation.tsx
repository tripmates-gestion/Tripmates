// export async function createUserRemote(
//   email: string,
//   password: string,
//   role: 'user' | 'business',
//   username: string,
// ): Promise<void> {
//   const requestBody = {
//     username,
//     email,
//     password,
//     description: '', 
//     role: role.toUpperCase(),
//     avatarURL: '',
//   };

//   console.log('[User Creation] Sending request to: POST http://localhost:8080/auth/register');
//   console.log('[User Creation] Request body:', {
//     ...requestBody
//   });

//   try {
//     const response = await fetch('http://localhost:8080/auth/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestBody)
//     });
    
//     if (!response.ok) {
//       const responseData = await response.json();
//       console.error('[USER CREATION] Error response:', {
//         status: response.status,
//         response: responseData
//       });
//       throw new Error(responseData.title || 'Error al registrar el usuario');
//     }
    
//     console.log('[User Creation] Success! Response:', {
//       status: response.status,
//       statusText: response.statusText,
//       data: 'No data returned'
//     });
    
//   } catch (error) {
//     console.error('[User Creation] Error during user creation:', error);
//     throw error; // Relanzamos el error para que pueda ser manejado por el llamador
//   }
// }


