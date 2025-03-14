"use client"

import React, {useState } from "react"
import styles from "@/app/styles/userMessages.module.css"
import { Message } from "@/app/types/Message" 
import trash from "@/app/assets/trash.svg" 
import Image from "next/image"



interface UserTableProps {
    data: Array<Message>

}

export const UserMessagesTable: React.FC<UserTableProps> = ({ data }) => {



    const [expandedRow, setExpandedRow] = useState<boolean[]>(Array(data.length).fill(false));
   

    const toggleExpand = (index: number) => {
        const rowToUpdate = !expandedRow[index];
        const newExpanded: boolean[] = Array(expandedRow.length).fill(false);
        newExpanded[index] = rowToUpdate
        setExpandedRow(newExpanded);
    }


    const trimMessage = (message: string) => {
        return message.slice(0, 30) + "..."
    }
    // const convertDate = (ISOData: string): string => {
    //     const date = new Date(ISOData);
    //     const year = date.getFullYear().toString().slice(-2);
    //     const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    //     const day = String(date.getDate()).padStart(2, '0');
    //     return `${month}/${day}/${year}`
    // }

 const open: string = `${styles.circlePlus} ${styles.closed} ${styles.opened}`
 const close: string = `${styles.circlePlus} ${styles.closed}`

    return (

        <div className={styles.tableWrapper}>

            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <table className={styles.table}>
                    <thead>
                        <tr style={{
                            backgroundColor: "#302e3a"
                        }}>
                            {/* <th scope="col" >#</th> */}
                            <th scope="col" className="text-center"></th>
                            <th scope="col" className="text-center">Input</th>
                            <th scope="col" className="text-center">Output</th>
                            <th scope="col" className="text-center">Key</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            data.map((message, index) => (
                                <React.Fragment key={message.id}>
                                    <tr onClick={() => toggleExpand(index)}
                                        className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                                        >
                                        <td >
                                            <div className={expandedRow[index]? open: close }>
                                                <div className={styles.circle}>
                                                    <div className={styles.horizontal}></div>
                                                    <div className={styles.vertical}></div>
                                                </div>
                                            </div>
                                            {/* {convertDate(message.createdAt)} */}
                                        </td>
                                        <td  >{trimMessage(message.input)}</td>
                                        <td  >{trimMessage(message.output)} </td>
                                        <td className="text-center">{message.encryptionKey}</td>
                                    </tr>
                                    <tr className={styles.messageDetails}>
                                        <td colSpan={4} 
                                        // style ={{padding:  "0px !important"}}
                                            >
                                        
                                            <div className={expandedRow[index]? styles.expandedContentOpen : styles.expandedContent}>
                                                <div className = "row d-flex">
                                                <div className={"col-2"}>
                                                    <strong>Input:</strong>
                                                </div>
                                                <div className = {"col-10 p-2 mt-2 mb-2"}> 
                                                    {message.input}
                                                </div>
                                                <div className = "col-2">
                                                    <strong>Output:</strong>  
                                                </div>
                                                <div className={"col-10 p-2 mt-2 mb-2"}>{
                                                    message.output}
                                                </div>
                                                <div className="col-2">
                                                    <strong>Key:</strong>
                                                </div>
                                                <div className={"col-10 p-2 mt-2 mb-2"}>
                                                    {message.encryptionKey}
                                                </div>
                                                </div>  
                                                <Image className ={styles.trash} role = {"button"} src = {trash} width={50} height={50} alt="delete message button"/> 
                                               

 
                                            </div>                                        
                                            
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>


    );
}
export default UserMessagesTable