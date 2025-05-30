import React ,{useState,useEffect} from 'react'


const useGeoLocation = () => {
  const [location,setLocation] = useState({
    loaded :false,
    coordinates :{lat : "" , lng :""}
  })
    
  const onSuccess = (location) => {
       setLocation({   
            loaded : true,
            coordinates :{
                lat : location.coords.latitude,
                lng : location.coords.longitude
            }
        })
  }

  const onError = (error) => {
    setLocation({
        loaded : true,
        error,
    })
}

  useEffect(()=>{
    if(!("geolocation" in navigator)){
        onError({
            message : "geoLocation not supported"
        })

    }

    navigator.geolocation.getCurrentPosition(onSuccess ,onError)
  },[])
  
    return location  
  
}

export default useGeoLocation