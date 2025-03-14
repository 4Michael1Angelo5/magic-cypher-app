"use client"

import React, { SetStateAction, useEffect, useState } from "react";
 
import { useSession } from "next-auth/react"; 


import styles from "../styles/menu.module.css"
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
 

interface DropDownMenuProps {
    isOpen: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

const DropDownMenu: React.FC<DropDownMenuProps>= ({isOpen,setOpen}) => {
    
    const {data:session,status} = useSession();
 
 

    return (
 
        <div id={"menu"} onClick={()=>setOpen(!isOpen)} className={isOpen ? `${styles.menu +" "+styles.menuOpen}` : `${styles.menu}`} >

            <Link href="/"> App </Link>     
            <Link href={"/fakeMessages"}> fake messages</Link>

            {status === "authenticated" && <Link href={`/messages/${session?.user.id}`}> get messges</Link>}    
            
            <button onClick={ () => signIn("github",{redirect:true,redirectTo:"/"})}>Log In</button>
            <span>coming soon</span>
            <button onClick={ () => signOut()}>Log Out</button>
        </div>

    );
}

interface MenuProps {
    menuIsOpen:boolean
    setMenuIsOpen:React.Dispatch<SetStateAction<boolean>>;
}

export const Menu:React.FC<MenuProps> = ({menuIsOpen,setMenuIsOpen}) => {

    const [isOpen, setOpen] = useState(menuIsOpen);

    useEffect(()=>{
        
        setMenuIsOpen(isOpen);

    },[isOpen,setMenuIsOpen])

    return (
        <>
    
            <DropDownMenu isOpen={isOpen} setOpen={setOpen} />
            <div>
                <div 
                  onClick={() => setOpen(!isOpen)} 
                  id="burger" 
                  className={isOpen ? `${styles.burgerMenu} ${styles.open}` : styles.burgerMenu} 
                  role="button" 
                  aria-expanded={isOpen} 
                  aria-controls="menu"
                >
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                    <span className={styles.bar} />

                </div>
            </div>

           
        </>
    );

}

 