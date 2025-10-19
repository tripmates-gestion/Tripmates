export interface User {
  id: string;
  firstName: string;
  lastName: string; 
  email: string;
  password: string;
  role: 'user' | 'business';
}

export function createUser(
  email: string,
  password: string,
  role: 'user' | 'business',
  firstName: string,
  lastName: string
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
                role: role.toUpperCase()
            }),
        }
    ).then((response) => {
        return response.json();
    }).then(
        (data) => {
            console.log('Usuario recibido:', data);
            const user: User = mapUser(data, firstName, lastName);
            console.log('Usuario mapeado:', user);
            return user;
        }
    );
}

function mapUser(data: any, firstName: string, lastName: string): User {
    return {
        id: data.id,
        firstName: firstName,
        lastName: lastName,
        email: data.email,
        password: data.password,
        role: data.role,
    };
}

