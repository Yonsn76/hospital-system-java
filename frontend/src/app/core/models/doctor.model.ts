export interface Doctor {
    id: number;
    specialization: string;
    licenseNumber: string;
    user: {
        id: number;
        username: string;
        personalDetails: {
            firstName: string;
            lastName: string;
        }
    }
}
