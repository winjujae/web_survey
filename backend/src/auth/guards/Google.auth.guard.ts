import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google'){
    async canActivate(context: ExecutionContext) {
        const activate = (await super.canActivate(context)) as boolean
        // 세션을 사용하지 않고 JWT 쿠키만 사용할 것이므로 로그인 세션 설정은 생략
        return activate;
    }
}