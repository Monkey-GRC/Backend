import type { Principal } from '../../../../common/auth/principal';
import { OrganizationalContext } from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';
export declare class GetOrganizationalContextUseCase {
    private readonly contexts;
    constructor(contexts: OrganizationalContextRepository);
    execute(principal: Principal): Promise<OrganizationalContext>;
}
