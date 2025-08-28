export type LoggedUser = {
  name: string;
  role: string;
};

// mocked user
let currentUser: LoggedUser | null = {
  name: "Cicrano",
  role: "Promotor",
};

export async function getCurrentUser(): Promise<LoggedUser | null> {
  return Promise.resolve(currentUser);
}

export async function logout(): Promise<void> {
  currentUser = null;
  return Promise.resolve();
}