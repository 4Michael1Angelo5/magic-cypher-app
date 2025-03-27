"use client"

import React, { SetStateAction, useEffect, useState, useRef } from "react";
 
import { useSession } from "next-auth/react"; 


import styles from "../styles/menu.module.css"
import Link from "next/link";
import {signOut } from "next-auth/react";
 

interface DropDownMenuProps {
    isOpen: boolean;
    setIsLogginOut:React.Dispatch<SetStateAction<boolean>>
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

const DropDownMenu: React.FC<DropDownMenuProps>= ({isOpen,setOpen,setIsLogginOut}) => {
    
    const {data:session,status} = useSession();
    const handleSignOut = async () =>{

        setIsLogginOut(true); 
        const res = await signOut({redirect:false})

        if(res){
            setIsLogginOut(false);
        }

    }
 
    return (
 
        <div id={"menu"} onClick={()=>setOpen(!isOpen)} className={isOpen ? `${styles.menu +" "+styles.menuOpen}` : `${styles.menu}`} >

            <Link href="/"> App </Link>     
            {/* <Link href={"/fakeMessages"}> fake messages</Link> */}

            {status === "authenticated" && <Link href={`/messages/${session?.user.id}`}> Cipher Vault</Link>}   

            {status === "authenticated" ? <button onClick={ () => handleSignOut()}>Log Out</button> : <Link href={"/signin"}>Log In</Link>   }

        </div>

    );
}


interface MenuProps {
    menuIsOpen:boolean 
    setIsLogginOut:React.Dispatch<SetStateAction<boolean>>
    setMenuIsOpen:React.Dispatch<SetStateAction<boolean>>;
}

export const Menu:React.FC<MenuProps> = ({menuIsOpen,setMenuIsOpen, setIsLogginOut}) => {

    const [isOpen, setOpen] = useState(menuIsOpen);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        
        // call parent function
        setMenuIsOpen(isOpen);

        // sync menu open close state with parent
    },[isOpen,setMenuIsOpen])

    
  useEffect(() => {
    // Close menu if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

    return (
        <>
    
            <div ref= {menuRef}><DropDownMenu setIsLogginOut = {setIsLogginOut} isOpen={isOpen} setOpen={setOpen} />
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
            </div>

           
        </>
    );

}

 