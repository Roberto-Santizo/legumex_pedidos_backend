import { AuthRepository } from "../domain/domain";
import { checkPassword, hashPassword } from "../utils/auth";
import { ConflictError, NotFoundError, WrongCredentials } from "../infrastructure/infrastructure";
import { AddUserClientPayload, CreateOrUpdateUserPayload, LoginFormPayload } from "../interfaces/interfaces";
import { generateJWT, generateRefreshJWT } from "../utils/jwt";
import { User } from "../entities/entities";
import { UserResource } from "../resources/resources";
import { clientProvider } from "../providers/clientRepositoryProvider";
import { userClientProvider } from "../providers/userClientRepositoryProvider";

export class AuthService {
    constructor(private repository: AuthRepository) { }

    async addClientsToUser(payload: string[], user: User) {
        const clients = await clientProvider.getClients();

        const data: AddUserClientPayload[] = payload.map((clientId) => {
            const client = clients.filter(client => client.id == +clientId)[0];
            if (!client) throw new NotFoundError('El cliente no existe');
            return { client, user }
        });

        await userClientProvider.addClientsToUser(data);
    }

    async createUser(payload: CreateOrUpdateUserPayload) {
        const user = await this.getUserByEmail(payload.email);
        if (user) throw new NotFoundError("El correo ya se encuentra registrado");

        const hashedPassword = await hashPassword(payload.password);
        payload.password = hashedPassword;

        const newUser = await this.repository.createUser(payload);

        this.addClientsToUser(payload.clients, newUser);
        return newUser;
    }

    async getUserById(id: User['id']) {
        const user = await this.repository.getUserById(id);
        if (!user) throw new NotFoundError("El usuario no existe");

        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.repository.getUserByEmail(email);
        return user;
    }

    async login(payload: LoginFormPayload) {
        const user = await this.getUserByEmail(payload.email);
        if (!user) throw new NotFoundError("El correo relacionado no se encuentra registrado");

        const passwordFlag = await checkPassword(payload.password, user.password);
        if (!passwordFlag) throw new WrongCredentials("Credenciales incorrectas");

        const jwt = generateJWT(user);
        const refreshJwt = generateRefreshJWT(user);

        return UserResource.userAuthenticated(user, jwt, refreshJwt);
    }

    async updateUserById(id: User['id'], payload: CreateOrUpdateUserPayload) {
        const user = await this.getUserById(id);
        const emailUser = await this.getUserByEmail(payload.email);

        if (emailUser) throw new ConflictError("El correo ingresado ya existe");

        if (payload.password) {
            const hashedPassword = await hashPassword(payload.password);
            payload.password = hashedPassword;
        } else {
            payload.password = user.password;
        }

        this.addClientsToUser(payload.clients, user);
        return this.repository.updateUserById(user, payload);
    }

    async checkStatus(user: User) {
        const jwt = generateJWT(user);
        const refreshJwt = generateRefreshJWT(user);

        return UserResource.userAuthenticated(user, jwt, refreshJwt);
    }

    async getUsers(){
        return this.repository.getUsers();
    }
}