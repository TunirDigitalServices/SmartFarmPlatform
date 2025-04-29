import React,{useState,useEffect} from 'react'
import axios from 'axios'
import useToken from '../../useToken'
import PropTypes from "prop-types";
// import SmallStats from './SmallStats';

const Stats = () => {
    
    const [fieldStats , setFS] = useState([])
    const [sensorStats , setSS] = useState({})

    //     const api = axios.create({ baseURL: "http://localhost:8000" });
    //  response.interceptors.request.use((req) => {
    //         if (useToken.getToken()) {
    //         req.headers.Authorization = `Bearer ${useToken.getToken()}`;
    //         } 
    //         return console.log(req);
    //        });
        
           
        useEffect(()=>{
           getFieldStats()  
           getSensorsStats()      
        },[])

            let userToken= JSON.parse(localStorage.getItem("token"));
            let token = userToken.token
            
            const getFieldStats = async () => {
                  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/dashboard/fields`,
                                                    {headers :  {"Authorization" : `Bearer ${token}`}}
                                                  );
                    console.log(response.data.farms[0].fields)
                    setFS(response.data.farms[0].fields);
     
            }
            const getSensorsStats = async () => {
              const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/dashboard/sensors`,
                                                 {headers :  {"Authorization" : `Bearer ${token}`}}
                                              );
                console.log(response.data.sensors)
                setSS(response.data.sensors);
 
        }
  
    return (
    <div className='field'>
      {
        fieldStats.map((stats,idx) =>(
          <h1>{stats.depth_level}</h1>

        ))
      }
    
    </div>
  )
}


export default Stats