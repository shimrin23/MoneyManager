export class UserService {
    private users: Map<string, any>;

    constructor() {
        this.users = new Map();
    }

    public getUserProfile(userId: string): any {
        return this.users.get(userId) || null;
    }

    public updateUserPreferences(userId: string, preferences: any): void {
        if (this.users.has(userId)) {
            this.users.get(userId).preferences = preferences;
        }
    }

    public addUser(userId: string, userProfile: any): void {
        this.users.set(userId, userProfile);
    }

    public deleteUser(userId: string): void {
        this.users.delete(userId);
    }
}