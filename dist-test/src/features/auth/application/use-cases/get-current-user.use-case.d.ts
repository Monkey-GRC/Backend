import { Principal } from '../../../../common/auth/principal';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
export declare class GetCurrentUserUseCase {
    private readonly users;
    constructor(users: AuthUserRepository);
    execute(principal: Principal): Promise<AuthUser>;
}
