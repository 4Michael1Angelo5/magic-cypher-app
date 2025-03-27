"use client"

import React, {useState,ReactNode} from "react"
import styles from "@/app/styles/tableStyles.module.css"
import { Message } from "@/app/types/Message" 
import trash from "@/app/assets/trash.svg" 
import Image from "next/image"
import { deleteMessage } from "@/lib/actions/deleteMessage";
import ReactDOM from "react-dom";

interface ModalProps {
    children:ReactNode; 
    onClose: ()=> void;
}

// need to create a portal because our app is wrapped in 
// inside an element with perspective which is making position 
// fixed not work => solution is to createPortal 
// for this component to get mounted to the body so it can assume
// the parent container's props
const Modal:React.FC<ModalProps>=({children,onClose}) => {
    return ReactDOM.createPortal(
        <div className= {styles.modal_overlay} onClick={onClose}>
            <div className= {styles.modal_content} onClick={(e) => e.stopPropagation()}>
            {children}
            <button className={styles.modal_dismiss_btn} onClick={onClose}> ok </button>
            </div>
      </div>,
      document.body
    )
}
 



interface UserTableProps {
    data: Array<Message>
    userId: string

}

export const UserMessagesTable: React.FC<UserTableProps> = ({ data , userId}) => {

    const [expandedRow, setExpandedRow] = useState<boolean[]>(Array(data.length).fill(false)); 
    const [messages,setMessages] = useState<Message[]>(data)
    const [showDialog,setShowDialog] = useState<boolean>(false);

    

    const handleDelete =  async (messageId:string) => {

        const confirm = window.confirm("are you sure you want to delete this message?")

        if(confirm){
            try{
        
                const res =   await deleteMessage(userId,messageId);
    
                     if(res.ok){ 
                        //filter out 
                        //the message we need to delete
                        const newMessages = messages.filter((e)=>e.id !== messageId);                
                        //update state                
                        setMessages(newMessages); 
                        setExpandedRow(new Array(newMessages.length).fill(false));
                        setShowDialog(true);
                        
                     }
            
            }catch(error:unknown){
                window.alert("An error occured while trying to delete your message: " +  error)
                console.error(error)
            }

        }        
               
    }
   

    const toggleExpand = (index: number) => {
        //store the value we need to update 
        const rowToUpdate = !expandedRow[index];
        //create new array with all false
        const newExpanded: boolean[] = Array(expandedRow.length).fill(false);
        // set new array to stored value
        newExpanded[index] = rowToUpdate
        setExpandedRow(newExpanded);
    }


    const trimMessage = (message: string) => {
        return message.slice(0, 30) + "..."
    }
    const convertDate = (ISOData: string): string => {
        const date = new Date(ISOData);
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}/${year}`
    }

 const open: string = `${styles.circlePlus} ${styles.closed} ${styles.opened}`
 const close: string = `${styles.circlePlus} ${styles.closed}`

    return (

        <>
            {
                showDialog && (
                    <Modal onClose ={ ()=>setShowDialog(false)}>
                        Your message has been deleted
                    </Modal>                    
                )
            }
          
      

        <div className={styles.tableWrapper}>
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <table className={styles.table}>
                    <thead className = {styles.thead}>
                        <tr 
                            className={styles.tr}                            
                            style={{
                            backgroundColor: "#302e3a"
                        }}>
                            {/* <th scope="col" >#</th> */}
                            <th scope="col" className= {styles.th}>Input</th>
                            <th scope="col" className= {styles.th}>Output</th>
                            <th scope="col" className= {styles.th}>Key</th>
                            <th scope="col" className= {styles.th}></th>
                        </tr>
                    </thead>

                    <tbody className={styles.tbody}>
                        {
                            messages.map((message, index) => (
                                <React.Fragment key={message.id}>
                                    <tr onClick={() => toggleExpand(index)}
                                        className={index % 2 === 0 ?  `${styles.tr} ${styles.evenRow}` : `${styles.tr} ${styles.oddRow}`}
                                        >
                                        <td className={`${styles.cellEntry} ${styles.td}`}>{trimMessage(message.input)}</td>
                                        <td className={`${styles.cellEntry} ${styles.td}`}>{trimMessage(message.output)} </td>
                                        <td className={`${styles.cellEntry} ${styles.td} text-center`}>{message.encryptionKey}</td>
                                        <td className={`${styles.cellEntry} ${styles.td}`} align="center">
                                            <div className={expandedRow[index]? open: close }>
                                                <div className={styles.circle}>
                                                    <div className={styles.horizontal}></div>
                                                    <div className={styles.vertical}></div>
                                                </div>
                                            </div> 
                                        </td>
                                    </tr>
                                    <tr className={styles.tr}>
                                        <td colSpan={4} className = {index%2==0? `${styles.td} ${styles.evenRow }`: `${styles.td} ${styles.oddRow }`}>                                        
                                            <div className={expandedRow[index]? styles.expandedContentOpen : styles.expandedContent}>
                                                <div className = "row d-flex justify-content-center" >

                                                <div className={ styles.expandedContentKey + " col-2"}>
                                                    <strong>Date:</strong>
                                                </div>

                                                <div className = {styles.expandedContentValue + " col-10"}> 
                                                    {convertDate(message.createdAt)}
                                                </div>

                                                <div className={ styles.expandedContentKey + " col-md-2 col-lg-2 col-sm-12"}>
                                                    <strong>Input:</strong>
                                                </div>

                                                <div className = {styles.expandedContentValue + " col-10  p-2 mt-2 mb-2"}> 
                                                    {message.input}
                                                </div>

                                                <div className={ styles.expandedContentKey + " col-md-2 col-lg-2 col-sm-12"}>
                                                    <strong>Output:</strong>  
                                                </div>

                                                <div className = {styles.expandedContentValue + " col-10  p-2 mt-2 mb-2"}> 
                                                    {message.output}
                                                    
                                                </div>
                                                <br/>

                                                <div className={ styles.expandedContentKey + " col-3"}>
                                                    <strong>Key:</strong>
                                                </div>

                                                <div className = {styles.expandedContentValue + " col-9"}>
                                                    {message.encryptionKey}
                                                </div>

                                                </div>  

                                                <Image className ={styles.trash} 
                                                    role = {"button"} 
                                                    src = {trash} width={50} height={50} alt="delete message button"
                                                    onClick={()=>handleDelete(message.id)}/> 
 
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
        </>


    );
}
export default UserMessagesTable