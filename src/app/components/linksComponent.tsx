"use client"

import Image from "next/image";
import buyMeACoffee from "../assets/buyMeACoffee.svg";
import gitHub from "../assets/github.png";
import logo from "../assets/logo.png";

const NavLinks =()=>{
    return(

        <>
             {/* this is a shit class --- needs to be renamed and actually styled "buffer doesn't acutaly do anything" */}
             <div className = "buffer" 
              style = {{
                height:"150px"
              }}/>

              <div className = "row d-flex justify-content-center">
                <div className="col-3 d-flex flex-column align-items-center">
                <Image src={buyMeACoffee} width={100} height = {100} alt="Buy me a coffee" />
                  <p className="text-center">buy me a coffee</p>
                </div>

                <div className="col-3 d-flex flex-column align-items-center">
                  <Image src ={gitHub} width= {100} height = {100} alt= "GitHub"/>
                  <p  className="text-center"> follow me on GitHub </p>
                </div>

                <div className="col-3  d-flex flex-column align-items-center">
                  <Image src ={logo} width={100} height = {100} alt= "GitHub"/>
                  <p  className="text-center"> check out my work</p>
                </div>

              </div>
        </>

    );
}

export default NavLinks