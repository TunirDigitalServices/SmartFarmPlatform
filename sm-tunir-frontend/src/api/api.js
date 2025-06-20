import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_BASE_URL });

api.interceptors.request.use((config) => {
    
    let userToken= JSON.parse(localStorage.getItem("token"));
      
    if(userToken){
    let token = userToken.token
    config.headers.Authorization =  `Bearer ${token}`;
    }

    return config;
},error => {
    Promise.reject(error)
});

api.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    
    return response;
  }, function (error) {
    const originalRequect = error.config
    
    if(error.response == undefined){
        //@SAIF EDDINE
        //add here HTML error server not available
    }

    if(error.response?.status === 401 && originalRequect.url === "/refresh"){
        return Promise.reject(error);
    }
    if(error.response?.status === 401 && !originalRequect._retry){
        originalRequect._retry = true;
        const refreshToken = localStorage.getItem("refreshToken")
        const user = JSON.parse(localStorage.getItem("user"))
        let option = 
        {
            email: user.email, role: user.role, uid: user.id, refreshToken: refreshToken
        }
        return api.post(`/refresh`,option)
        .then((res) =>{
            console.log(res.status)
            if(res.status === 200 ){
                localStorage.setItem("token",JSON.stringify({ token: res.data.token }))
                let userToken= JSON.parse(localStorage.getItem("token"));
                api.defaults.headers.common["Authorization"] = `Bearer ${userToken.token}`;
                return api(originalRequect)
            }
        })

    }
    return Promise.reject(error);
    
});


export default api