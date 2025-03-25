"use client"
import { signIn } from "next-auth/react"
import github from "@/app/assets/github.png"
import google from "@/app/assets/google.png"
import Image from "next/image"
import styles from "@/app/styles/signIn.module.css"  
import {useState } from "react" 

import { UserSignInLoading } from "../components/signingInComponent"

const SignInPage = () => {
 
    const [isSingingIn, setIsSigningIn] = useState(false); 

    const fetchBaseUrl = async () => {
        try {
            const res = await fetch("/api/auth/config");

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error("Failed to fetch base URL:", error);
            throw error; // Re-throw to let handleSignIn catch it
        }
    };

    const handleSignIn = async (event:React.MouseEvent<HTMLButtonElement>  ,provider: string) => {
        event.preventDefault();
        setIsSigningIn(true);
        try {
            const data = await fetchBaseUrl();
            console.log(data)

            if (!data.baseURL) {
                throw new Error("Failed to fetch base url")
            } else {
                signIn(provider, { callbackUrl: data.baseURL })
            }

        } catch (error) {
            console.error(error);
        }
    }

   

    return (

        <>
            {
                isSingingIn ?
                    <UserSignInLoading status="Logging in" />
                    :
                    <>
                        <h1 className={styles.title}> Welcome back</h1>
                        <p className={styles.welcome_user}> Your Ciphers are safe. Login to retrieve them.</p>
                        <div className="row d-flex justify-content-center align-content-center" style={{ minHeight: "100svh" }}> 
                            {/* need to change min height = 100svh above */}

                            <form className={styles.login_component}>

                                <button
                                    className={styles.signIn_btn}
                                    onClick={(e) => handleSignIn(e,"github")}>
                                    <Image src={github} width={50} height={50} alt="sign in with github" className={styles.provider_logo} />
                                    Sign in with GitHub
                                </button>
                                <button
                                    className={styles.signIn_btn}
                                    onClick={(e) => handleSignIn(e,"google")} >
                                    <Image src={google} width={50} height={50} alt="sign in with google" className={styles.provider_logo} />
                                    Sign in with Google
                                </button> 
                            </form>
                        </div>
                    </>

            }
        </>
    )

}

export default SignInPage