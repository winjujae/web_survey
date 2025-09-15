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
      const { id, name, emails } = profile
      console.log('accessToken',accessToken)
      console.log('refreshToken',refreshToken)
      console.log('profile',profile)
      const user = {
        id: id,
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
      }

      return user
    } catch (error) {
      return error
    }
  }
}