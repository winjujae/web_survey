import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
// @ts-ignore - 타입 패키지가 없을 수 있어 any 허용
import { Strategy as KakaoStrategy, Profile as KakaoProfile } from 'passport-kakao'

@Injectable()
export class NestKakaoStrategy extends PassportStrategy(KakaoStrategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '', // 선택 사항
      callbackURL: process.env.KAKAO_CALLBACK_URL!,
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Kakao profile 구조 참고: profile.id, profile._json.kakao_account.email 등
    const id = String(profile?.id)
    const kakaoAccount = profile?._json?.kakao_account || {}
    const email: string | undefined = kakaoAccount?.email
    const profileObj = kakaoAccount?.profile || profile?._json?.properties || {}
    const nickname: string | undefined = profileObj?.nickname
    const picture: string | undefined = profileObj?.profile_image_url || profileObj?.thumbnail_image_url
    const emailVerified: boolean = kakaoAccount?.is_email_verified ?? true

    const user = {
      kakaoId: id,
      email,
      name: nickname || (email ? email.split('@')[0] : '카카오사용자'),
      picture: picture || null,
      emailVerified,
    }

    return user
  }
}


