"use client"

import styles from "./styles/appWrapper.module.css"

import { Menu } from "./components/menu";
import { WavyDivider } from "./components/wavyDividerComponent";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";


export const App = ({children}:{children:React.ReactNode})=>{

    const [menuIsOpen , setMenuIsOpen] = useState(false);

    return(

        <SessionProvider>

            <div className = {styles.page} 
                style ={{
                    overflowY:menuIsOpen?"hidden":"auto",
                    position:menuIsOpen?"fixed":"relative"
                }}>

                <WavyDivider/>

                <Menu menuIsOpen = {menuIsOpen} setMenuIsOpen={setMenuIsOpen}/>

                <div className = "container"
                    style = {{
                    perspective:"12px",
                    transform:menuIsOpen?"scale(.5) translateZ(-10px)": "scale(1) translateZ(0px)",
                    opacity:menuIsOpen?".5":"1",
                    transition:"opacity, transform .3s ease-in-out"
                    }}>
                    
                    <main>                 
                    {children}
                    </main>  
                </div>
            </div>
        </SessionProvider>
    );
}
