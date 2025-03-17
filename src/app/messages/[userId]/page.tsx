 

import { getMessages } from "@/lib/actions/getMessages";
import {UserMessagesTable}  from "@/app/components/tableComponent"
import {getAuthUser} from "@/lib/actions/getAuthUser"
import { redirect } from "next/navigation"; 
import { Message } from "@/app/types/Message";;
import styles from "@/app/styles/userMessages.module.css"
import { AuthUser } from "@/app/types/AuthUser";  
import anonymous from "@/app/assets/anonymous.svg"
import Image from "next/image";

const UserPage =  async ( {params} : {params: Promise<{userId:string}>})=>{
    
    const {userId} = await params;
 
    // *******************************************************************************************
    // PROTECT USER DATA - ensure user is authenticated and has permission to view messages
    const user:AuthUser | null = await getAuthUser();

    if(!user){
        // redirect to home page .... this should really be sign in page but I don't have one yet
        // @TODO create a dedicated oauth signin page
        redirect("/");
    }

    if(user.id != userId || user.error === "unauthorized"){
        // redirect to unathorized page
        // @TODO create an unathorized page
        redirect("/unauthorized");
    }
    //********************************************************************************************** */

    let data: Message[] | undefined; 


    try{

        data = await getMessages(userId)
 

    }catch(error){

        console.error(error)
    }

    return(
        <div style = {{
            minHeight:"100svh"
        }}>
                <div className="mt-5 mb-3 pb-5 heading">

                <div className = "col-12 d-flex align-items-center">
                    {
                        
                        user.image?
                        <img  alt ="user profile picture" width={100} height={100} src ={user.image} 
                        style={{width:"50px", height:"50px", marginRight:"10px"}}/> 
                        :
                        <div className = {styles.placeHolder}>

                            <Image src = {anonymous} width={100} height = {100} alt = "anonymous user profile picture"
                                style={{width:"50px", height:"50px", marginRight:"10px"}}
                            />
                            
                        </div>

                    }

                    <h1 className="display-1">
                        {user.name}
                    </h1>
                </div>

                    <div className = "col-12 mt-2">

                    <h2>
                    Cipher Vault
                    </h2>
                    </div>
                    <p>
                    Secure, store, and access your messages anytime.
                    </p>
                    
                </div>
 

            {
              data 
              ?
              <UserMessagesTable data  = {data} userId = {userId}/>
              :
              <p>An Error occured while fetching messages from the server</p>
            }

        </div>

    );
}

export default UserPage