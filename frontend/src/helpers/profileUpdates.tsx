export function updateDescription(current: string, updated: string, accessToken: string) {
    if (current == updated) {
        return;
    }
    console.log('Updating description from', current, 'to', updated);
    fetch('http://localhost:8080/users/me/description', {
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        method: 'PATCH',
        body: JSON.stringify({ description: updated }),
    }).then((response) => {
        if (!response.ok) {
            throw new Error('Failed to update description');
        }
        console.log('Description updated successfully');
    }).catch((error) => {
        console.error('Error updating description:', error);
    });
}

// codigo repetido
export function updateUsername(current: string, updated: string, accessToken: string) {
    if (current == updated) {
        return;
    }
    console.log('Updating username from', current, 'to', updated);
    fetch('http://localhost:8080/users/me/username', {
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        method: 'PATCH',
        body: JSON.stringify({ username: updated }),
    }).then((response) => {
        if (!response.ok) {
            throw new Error('Failed to update username');
        }
        console.log('Username updated successfully');
    }).catch((error) => {
        console.error('Error updating username:', error);
    });
}