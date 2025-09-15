import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({    
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    })

  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { id, displayName, name, emails, photos } = profile;
      
      // 실제 이름 처리: displayName 우선, 없으면 givenName + familyName 조합
      const actualName = displayName || 
        `${name.givenName || ''} ${name.familyName || ''}`.trim() || 
        emails[0].value.split('@')[0]; // 최후 수단으로 이메일 아이디 사용
      
      const user = {
        googleId: id,
        email: emails[0].value,
        name: actualName, // 실제 이름만 저장
        picture: photos && photos[0] ? photos[0].value : null,
        emailVerified: emails[0].verified || true,
      };

      console.log('Google OAuth 사용자 정보:', user);
      return user;
    } catch (error) {
      console.error('Google OAuth validate 에러:', error);
      throw error;
    }
  }
}