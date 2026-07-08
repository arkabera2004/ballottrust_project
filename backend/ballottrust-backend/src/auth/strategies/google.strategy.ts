import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL!,

      scope: [
        'email',
        'profile',
      ],
    });
  }

  async validate(
    accessToken: string,

    refreshToken: string,

    profile: Profile,

    done: VerifyCallback,
  ) {

    const {

      id,

      displayName,

      emails,

      photos,

    } = profile;

    done(null, {

      providerId: id,

      email:
        emails?.[0]?.value,

      fullName:
        displayName,

      avatar:
        photos?.[0]?.value,

    });

  }
}