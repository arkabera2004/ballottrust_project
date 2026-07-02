import { AUTH_KEYS } from '../constants/auth';

class TokenStorage {

  getAccessToken() {
    return localStorage.getItem(
      AUTH_KEYS.ACCESS_TOKEN,
    );
  }

  setAccessToken(
    token: string,
  ) {
    localStorage.setItem(
      AUTH_KEYS.ACCESS_TOKEN,
      token,
    );
  }

  getRefreshToken() {
    return localStorage.getItem(
      AUTH_KEYS.REFRESH_TOKEN,
    );
  }

  setRefreshToken(
    token: string,
  ) {
    localStorage.setItem(
      AUTH_KEYS.REFRESH_TOKEN,
      token,
    );
  }

  getUser() {

    const user =
      localStorage.getItem(
        AUTH_KEYS.USER,
      );

    return user
      ? JSON.parse(user)
      : null;
  }

  setUser(user: unknown) {

    localStorage.setItem(
      AUTH_KEYS.USER,
      JSON.stringify(user),
    );

  }

  clear() {

    Object.values(AUTH_KEYS).forEach(
      (key) =>
        localStorage.removeItem(
          key,
        ),
    );

  }

}

export default new TokenStorage();