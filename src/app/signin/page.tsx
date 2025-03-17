"use client"
import { signIn } from "next-auth/react"
import github from "@/app/assets/github.png"
import google from "@/app/assets/google.png"
import Image from "next/image" 
import styles from "@/app/styles/signIn.module.css" 
const SignInPage = ()=>{

    return(

        <>
        <h1 className= {styles.title}> Welcome back</h1>
        <p className= {styles.welcome_user}> Your Ciphers are safe. Login to retrieve them.</p>
        <div className="row d-flex justify-content-center align-content-center" style = {{minHeight:"100svh"}}>

            <div className={styles.login_component}>
            
            <button 
                className= {styles.signIn_btn}
                onClick={()=>signIn("github",{redirect:true,redirectTo:"/"})}>
                <Image src = {github} width={50} height={50} alt="sign in with github" className={styles.provider_logo}/>
                Sign in with GitHub
            </button>
            <button
                className= {styles.signIn_btn}
                onClick={()=>signIn("google",{redirect:true,redirectTo:"/"})} >
                <Image src = {google} width = {50} height={50} alt="sign in with google" className={styles.provider_logo}/>
                Sign in with Google                
            </button>

            </div>
        </div>
        </>
    )

}

export default SignInPage