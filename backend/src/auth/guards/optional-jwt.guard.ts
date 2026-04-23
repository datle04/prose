import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        // Không throw lỗi nếu không có token — trả về null
        return user || null;
    }
}
