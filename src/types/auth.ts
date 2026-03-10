// ── Auth-related types ──
export interface LoginRequest {
  codename: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    codename: string;
    rp_name: string;
    role: 'anbu' | 'chef_anbu';
    status: 'active' | 'pending';
  };
}

export interface RegisterRequest {
  rp_name: string;
  codename: string;
  password: string;
  registration_code: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    codename: string;
    status: 'pending';
  };
}

export interface AuthState {
  token: string | null;
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isChefAnbu: boolean;
}
