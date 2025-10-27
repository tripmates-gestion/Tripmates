import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export async function getCurrentUser(token: string) {
    return apiFetch(ENDPOINTS.USER_ME, {
        headers: { Authorization: `Bearer ${token}` },
    });
}
// TODO: falta migrar a este modelo de capas la modificación de un perfil
// además se tiene que considerar que ahora solo se pegaría a un endpoint PATCH /users/me
 
// export async function updateUser(token: string, description: string) {
//     return apiFetch(ENDPOINTS.USER_ME_DESCRIPTION, {
//         headers: { Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ description }),
//     });
// }