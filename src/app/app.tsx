"use client"

import styles from "./styles/appWrapper.module.css"

import { Menu } from "./components/menu";
import { WavyDivider } from "./components/wavyDividerComponent";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import {UserSignInLoading} from "@/app/components/signingInComponent";


export const App = ({children}:{children:React.ReactNode})=>{

    const [menuIsOpen , setMenuIsOpen] = useState(false);
    const [isLoggingOut, setIsLogginOut] = useState(false);

    return(

        <SessionProvider>
            
            <div className = {styles.page} 
                style ={{
                    overflowY:menuIsOpen?"hidden":"auto",
                    position:menuIsOpen?"fixed":"relative"
                }}>

                <WavyDivider/>

                <Menu menuIsOpen = {menuIsOpen} setMenuIsOpen={setMenuIsOpen} setIsLogginOut = {setIsLogginOut}/>

                {
                    isLoggingOut?
                    <UserSignInLoading status={"Logging out"}/>:
                    <div className = "container"
                    style = {{
                    perspective:"12px",
                    transform:menuIsOpen?"scale(.5) translateZ(-10px)": "scale(1) translateZ(0px)",
                    opacity:menuIsOpen?".5":"1",
                    transition:"all .2s ease-in-out"
                    }}>
                    
                    <main>                 
                    {children}
                    </main>  
                </div>

                }      
            </div>
        </SessionProvider>
    );
}
