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
}

export const Menu:React.FC<MenuProps> = (menuIsOpen) => {

    const [isOpen, setOpen] = useState(false);

    useEffect(()=>{
        

    },[isOpen])


    return (
        <>

            <DropDownMenu isOpen={isOpen} setOpen={setOpen} />
            <div>
                <div onClick={()=>{setOpen(!isOpen)}} id="burger" className={isOpen ? `${styles.burgerMenu} ${styles.open}` : styles.burgerMenu}>
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                </div>
            </div>
        </>
    );

}

 