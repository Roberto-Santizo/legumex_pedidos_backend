import { DomainError } from "../../domain/domain";

export class ConflictError extends DomainError { }
export class NotAuthorizedError extends DomainError { }
export class NotFoundError extends DomainError {}
export class WrongCredentials extends DomainError {}