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
      
      const user = {
        googleId: id,
        email: emails[0].value,
        name: displayName || `${name.givenName} ${name.familyName}`,
        firstName: name.givenName,
        lastName: name.familyName,
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