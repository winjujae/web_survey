import { Injectable, Inject } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "../auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer{
    constructor(
        private readonly authService : AuthService,
    ){super();}

    serializeUser(user: any, done: Function) {
        done(null,user)
    }
    async deserializeUser(payload: any, done: Function) {
        try{
            if(!payload?.id) return done(null, null)
            const user = await this.authService.findUser(payload.id);
            return user? done(null, user) : done(null, null)
        }catch(err){
            return done(err, null)
        }
    } //-> 다음 authService에서 findUser 메서드 만들기
}