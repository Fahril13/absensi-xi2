import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'guru' | 'siswa';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'guru' | 'siswa';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'guru' | 'siswa';
  }
}