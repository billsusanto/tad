import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

function getAdapter() {
  const db = getDb();
  if (!db) {
    return undefined;
  }
  return DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  });
}

const DEV_EMAIL = 'dev@tad.local';
const DEV_NAME = 'Dev User';

function getDevCredentialsProvider() {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  return [
    Credentials({
      id: 'dev-login',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (credentials?.email !== DEV_EMAIL) {
          return null;
        }

        const db = getDb();
        if (!db) {
          throw new Error('Database not configured');
        }

        const existingUsers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, DEV_EMAIL))
          .limit(1);

        if (existingUsers.length > 0) {
          return {
            id: existingUsers[0].id,
            email: existingUsers[0].email,
            name: existingUsers[0].name,
            image: existingUsers[0].image,
          };
        }

        const newUsers = await db
          .insert(schema.users)
          .values({
            email: DEV_EMAIL,
            name: DEV_NAME,
            emailVerified: new Date(),
          })
          .returning();

        const newUser = newUsers[0];
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          image: newUser.image,
        };
      },
    }),
  ];
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: getAdapter(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    ...getDevCredentialsProvider(),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
