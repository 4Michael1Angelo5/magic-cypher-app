"use client"

import UserMessagesTable from "../components/tableComponent"; 
import React from "react"; 
import { useSession } from "next-auth/react";
import Image from "next/image";
import anonymous from "@/app/assets/anonymous.svg"
 
 
interface Data {
    id:string;
    userId:string;
    input:string;
    output:string;
    createdAt:string;
    encryptionKey:number;
    time:number;
}
const DATA: Data[] = [
    {
        id: "msg_001",
        userId: "user_123",
        input: "Hello, world!",
        output: "U2FsdGVkX1+9q...",
        createdAt: new Date("2024-03-11T12:30:00Z").toISOString(),
        encryptionKey: 1,
        time:1222
    },
    {
        id: "msg_002",
        userId: "user_456",
        input: "This is a secret message.",
        output: "U2FsdGVkX1+h3...",
        createdAt: new Date("2024-03-10T08:15:00Z").toISOString(),
        encryptionKey: 898,
        time:101910
    },
    {
        id: "msg_003",
        userId: "user_789",
        input: "I'm baby asymmetrical affogato snackwave, yr bruh mixtape farm-to-table +1 fit cray single-origin coffee bicycle rights DSA. Pickled affogato mumblecore post-ironic, cliche live-edge raw denim kickstarter. Organic semiotics selfies celiac. Asymmetrical farm-to-table Brooklyn jianbing gochujang, messenger bag ugh jean shorts.",
        output: "IPhone echo park fashion axe, keffiyeh actually sus tacos. Chartreuse 90's meggings gluten-free banjo bruh gorpcore affogato la croix +1 williamsburg cupping ugh. Flexitarian Brooklyn edison bulb kinfolk yes plz artisan. Pickled bodega boys street art taiyaki, yr raw denim put a bird on it activated charcoal tonx quinoa four loko edison bulb fanny pack asymmetrical.",
        createdAt: new Date("2024-03-09T17:45:00Z").toISOString(),
        encryptionKey:  12344,
        time:111,
    },
    {
        id: "msg_004",
        userId: "user_321",
        input: "Godard squid wayfarers, selfies vape mixtape tote bag edison bulb ascot sustainable keffiyeh chillwave. Lomo iceland master cleanse chicharrones mustache helvetica, vape pop-up tonx adaptogen roof party plaid yes plz tousled same. Heirloom slow-carb green juice, health goth banh mi tbh wolf. Sartorial microdosing beard, hashtag williamsburg tonx hell of keffiyeh etsy.",
        output: "Asymmetrical keffiyeh coloring book microdosing portland disrupt single-origin coffee yuccie vegan plaid copper mug normcore prism. Street art mumblecore gorpcore swag vice mixtape flannel post-ironic bodega boys. Forage vinyl mixtape drinking vinegar etsy, irony you probably haven't heard of them messenger bag chicharrones tilde. Ennui blue bottle banh mi, meggings banjo bruh pork belly slow-carb",
        createdAt: new Date("2024-03-08T21:10:00Z").toISOString(),
        encryptionKey: 90,
        time:1800
    },
    {
        id: "msg_005",
        userId: "user_654",
        input: "Final test message here.",
        output: "U2FsdGVkX1+7q...",
        createdAt: new Date("2024-03-07T14:00:00Z").toISOString(),
        encryptionKey: 12334,
        time: 1233
    }
];


 
const MessagesUI = ()=>{
    
    const {data:session} = useSession();

    return (
 
        <div style = {{minHeight:"100svh"}}>
            <div className="mt-5 mb-5 pb-5 heading">
                <div className = "col-12 d-flex align-items-center">
                {
                    session?.user?.image
                    ?
                    <img alt ="user profile picture" width={100} height={100} src ={session.user.image} 
                    style={{width:"50px", height:"50px", marginRight:"10px"}}/> 
                    :
                    <Image 
                        src = {anonymous} width={100} height = {100} 
                        alt = "anonymous user profile picture"
                        style={{width:"50px", height:"50px", marginRight:"10px"}}
                        />
                }
                    <h1 className = "display-1">
                        John Doe
                    </h1>
                
                </div>
                
                <h2>
                    Cipher Vault
                </h2>
                <p>
                Secure, store, and access your messages anytime.

                </p>
                
            </div>
            

        <UserMessagesTable data = {DATA} userId={"123"}/>
        </div>

    )
}

export default MessagesUI