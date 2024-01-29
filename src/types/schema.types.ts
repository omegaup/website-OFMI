type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  post_id: string;
  createdAt: string;
  updatedA: string;
}

export interface Post {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedA: string;
}

