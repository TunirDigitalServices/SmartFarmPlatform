import React,{useState , useEffect} from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/api'
import { useParams } from 'react-router-dom';



const Valid = () => {
    
    const [confirm , setConfirm] = useState("");
    const [confirmMsg ,setConfirmMsg] = useState("");
    
    const params  = useParams() 
    let tokenToValid = params.ToValid

    useEffect(()=>{
        const Validate = async () =>{
        await api.get(`/valid-account/${tokenToValid}`).then(response => {
            setConfirm(response)
            console.log(response,"res");
            
            if(response.data.type && response.data.type == "success"){
                let msg = response.data.message    
                setConfirmMsg(msg)
            }
        }).catch((e) => {
            setConfirmMsg("error_link_account")
          })
        }
        Validate()
    },[])



  return (
  
    <div className='align-items-center auth px-0 h-100' style={{textAlign: "center",marginTop: "58px"}}> 
            <h3>
                <strong>{confirmMsg}</strong>
            </h3>
  
        <Link to="/Login">
            Login
        </Link>
    </div>
 
  )

}

export default Valid