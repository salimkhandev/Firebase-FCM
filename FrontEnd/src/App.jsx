import { generateToken } from "./notifications/firebase";
import { useEffect,useState } from "react";
import {onMessage} from "firebase/messaging";
import {messaging} from "./notifications/firebase";
const App=()=>{
    const [token,setToken]=useState(null);
    useEffect(()=>{
        const token=localStorage.getItem('token');
        if(token){
            setToken(token);
        }else{
            generateToken();
        }
        onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
        });
    },[])
    return(
        <div>
            <h1>Push Notification</h1>
            {/* add a copy button */}
            <button onClick={()=>{
                navigator.clipboard.writeText(token);
                
            }}>Copy Token</button>
            <p>Token: {token}</p>
            <button onClick={generateToken}>Generate Token</button>
        </div>
    )
}   
export default App;