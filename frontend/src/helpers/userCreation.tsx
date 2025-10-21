import type { User } from '../types/user';

export function createUser(
  email: string,
  password: string,
  role: 'user' | 'business',
  name: string,
): Promise<User> {
    return fetch(
        'http://localhost:8080/users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                role: role.toUpperCase(),
                name,
                description: '',
            }),
        }
    ).then((response) => {
        return response.json();
    }).then(
        (data) => {
            console.log('Usuario recibido:', data);
            const user: User = mapUser(data);
            console.log('Usuario mapeado:', user);
            // guardar el usuario en el contexto
            return user;
        }
    );
}

function mapUser(data: any): User {
    return {
        id: data.id,
        username: data.name,
        email: data.email,
        role: data.role,
    };
}
