import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao'){
    async canActivate(context: ExecutionContext) {
        const activate = (await super.canActivate(context)) as boolean
        // 세션 사용 안 함: JWT 쿠키 기반 처리
        return activate;
    }
}


