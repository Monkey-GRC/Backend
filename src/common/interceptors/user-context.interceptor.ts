import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '../utils/request-context';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const req = context.switchToHttp().getRequest();

        const store = {
            userId: req.user?.id,
            clientId: req.user?.client_id ?? undefined,
            role: req.user?.role,
        };

        return new Observable((subscriber) => {
            RequestContext.run(store, () => {
                next.handle().subscribe(subscriber);
            });
        });
    }
}
