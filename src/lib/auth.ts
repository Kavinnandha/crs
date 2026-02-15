import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import argon2 from "argon2";
import { authConfig } from "@/lib/auth.config";



export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const admin = await Admin.findOne({ email: credentials.email });
                if (!admin) {
                    return null;
                }

                const isValid = await argon2.verify(
                    admin.password,
                    credentials.password as string
                );
                if (!isValid) {
                    return null;
                }

                return {
                    id: admin._id.toString(),
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                };
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
});
