export interface BusinessAchievementDTO {
    id: string;
    visible: boolean;
}
// TODO: Reemplazr por llamado real al backend
export const getMyBusinessAchievementsAPI = async (accessToken: string): Promise<BusinessAchievementDTO[]> => {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Retornamos una lista de logros simulada
    return [
        { id: 'firstLike', visible: true },
        { id: '10Likes', visible: false },
        { id: '50Likes', visible: true },
        { id: '100Likes', visible: false },
    ];
};

//TODO: Reemplazar por endpoint real
export const updateMyBusinessAchievementsVisibilityAPI = async (accessToken: string, changes: { id: string; visible: boolean }[]): Promise<void> => {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Updated visibility for token ${accessToken}:`, changes);
};
