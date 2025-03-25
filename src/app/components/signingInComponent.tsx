"use client"
import Loading from "@/app/components/loadingComponent"

interface LoginLogoutProps {

    status?: "Logging in" | "Logging out" 

}

export const UserSignInLoading: React.FC<LoginLogoutProps>= ({status})=>{

    const windowHeight = window.innerHeight;
    
    return (
        <>
            

            <div className="d-flex flex-column justify-content-center align-content-center align-items-center"
                style={{minHeight:windowHeight}}>                
                <h1>{status}</h1>
                <Loading/>
            </div>
        </>



    )
}