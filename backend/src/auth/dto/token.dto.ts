export class TokenDto {
  access_token: string;
  refresh_token: string;
  user: {
    user_id: string;
    email: string;
    nickname: string;
    role: string;
  };
}
