"use server";

import { signIn,signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export const login = async () => {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  };

export const logout = async ()=>{
    await signOut();
}