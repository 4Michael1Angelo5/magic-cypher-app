"use client"
 
import styles from "../styles/squareLoader.module.css";
 
interface LoadingProps {

  loadingState?:"Encrypting"|"Decrypting"|null

}

const Loading: React.FC<LoadingProps> = ({loadingState})=>{
 
    return(
      <div className="container">
        {`${loadingState}...`} 
        <div className= {styles.loadingspinner}>
        
          <div id="square1"></div>
          <div id="square2"></div>
          <div id="square3"></div>
          <div id="square4"></div>
          <div id="square5"></div>
        </div>
      </div>
    )
  }

  export default Loading;