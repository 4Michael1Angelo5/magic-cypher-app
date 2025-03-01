"use client"

import React, { SetStateAction, useEffect, useState } from "react";


import styles from "../styles/menu.module.css"

interface DropDownMenuProps {
    isOpen: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

const DropDownMenu: React.FC<DropDownMenuProps>= ({isOpen,setOpen}) => {


    return (
 
        <div id={"menu"} onClick={()=>setOpen(!isOpen)} className={isOpen ? `${styles.menu +" "+styles.menuOpen}` : `${styles.menu}`} >

            <a href="/"> App </a>

            <a href='/'>Login</a>
            <span>coming soon</span>

        </div>

    );
}

interface MenuProps {
    menuIsOpen:boolean
    setMenuIsOpen:React.Dispatch<SetStateAction<boolean>>;
}

export const Menu:React.FC<MenuProps> = ({menuIsOpen,setMenuIsOpen}) => {

    const [isOpen, setOpen] = useState(false);

    useEffect(()=>{
        
        setMenuIsOpen(isOpen);

    },[isOpen])


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

 