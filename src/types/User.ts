export type LoginResponse = {
  user: string;
  role: string;
  access_token: string;
  refresh_token: string;
};

export type CurrentUser = {
  username: string;
  role: string;
};

export type UserResponse = {
    id: string;
    name: string;
};

