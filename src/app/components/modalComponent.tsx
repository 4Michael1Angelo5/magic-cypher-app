import {ReactNode} from "react";
import ReactDOM from "react-dom";
import styles from "@/app/styles/tableStyles.module.css"

interface ModalProps {
    children:ReactNode; 
    onClose: ()=> void;
}

export const Modal:React.FC<ModalProps>=({children,onClose}) => {
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