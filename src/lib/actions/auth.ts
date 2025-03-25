"use server";

import { signIn, signOut } from "next-auth/react"; 

export const login = async (provider:"google"|"github") => { 
  await signIn(provider)
  };

export const logout = async ()=>{
    await signOut();
}