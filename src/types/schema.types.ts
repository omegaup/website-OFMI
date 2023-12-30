type Role = "user" | "admin";

export interface UserAuth {
  id: string;
  email: string;
  password: string;
  role: Role;
}
