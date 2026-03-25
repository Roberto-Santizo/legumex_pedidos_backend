import { User } from "../entities/User";

export class UserResource {
    static userAuthenticated(user: User, jwt: string, refreshJwt: string) {
        return {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: jwt,
            refreshToken: refreshJwt,
        }
    }

    static userDetails(user: User) {
        return {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }
    }

    static collection(users: User[]){
        return users.map(user => this.userDetails(user));
    }
}