import { NextResponse } from "next/server"

// get method for getting current baseURL
export const GET = async ()=>{
   
   return NextResponse.json({baseURL: process.env.NEXTAUTH_URL})
}

