import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import protectedRoutes from "../constants/protectedRoutes"
import NotFound from '../pages/NotFound';
import App from '../apps/App';
import Auth from '../apps/auth'
import Login from '../pages/auth/Login';
import logo from "../assets/images/Logo smart farm1.jpg"
import SignUp from '../pages/auth/SignUp';
import Dashboard from "../components/Simulation/Dashboard"
import { fakeUsers } from '../constants/fakeUsers';
import PrivateRoute from './PrivateRouter';
import ForgotPwd from '../pages/auth/ForgotPwd';
import Terms from '../pages/auth/Terms';
import Privacy from '../pages/auth/Privacy';
import useToken from '../useToken';
import Overview from '../views/Overview';
import NewPassValid from '../pages/auth/NewPassValid';
import Valid from '../pages/auth/Valid';


const fakeAuth = {
  isAuthenticated: false,
};
function Router() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  localStorage.setItem("RememberMe", false);
  const { token, setToken } = useToken();

  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "null") {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
  
    // Initial load
    syncUser();
  
    // Listen for manual updates (e.g., logout)
    window.addEventListener('user-updated', syncUser);
  
    return () => {
      window.removeEventListener('user-updated', syncUser);
    };
  }, []);
  

  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');

  //   if (storedUser) {

  //     setUser(JSON.parse(storedUser));
  //     setIsLoading(false);
  //   } else {

  //     setTimeout(() => {
  //       if (fakeAuth.isAuthenticated) {
  //         const selectedUser = fakeUsers[0]; 


  //         setUser(selectedUser);
  //         localStorage.setItem('user', JSON.stringify(selectedUser)); 
  //       } else {
  //         setUser(false);
  //       }
  //       setIsLoading(false);
  //     }, 1500);
  //   }
  // }, []);

  if (isLoading) {
    return (
      <div className="position-fixed h-100 w-100 bg-white d-flex justify-content-center align-items-center" style={{ zIndex: 6 }}>
        <img src={logo} alt="Loading" className="loading-logo" />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>

          {user ? (
            <Route path="/" element={<App />}>
              <Route
                index
                // element={
                //   user.offre === "1" ? (
                //     <Navigate to="/dashboard" />
                //   ) : (
                //     <Navigate to="/overview" />
                //   )
                // }
                element={user.offre === "1" ? <Dashboard /> : <Overview />}

              />
              {protectedRoutes.map(({ path, element, roles }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <PrivateRoute user={user} roles={roles} component={element} />
                  }
                />
              ))}
            </Route>
          ) : (

            <Route path="/" element={<Auth />}>
              <Route index element={<Login />} />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="forget-password" element={<ForgotPwd />} />
              <Route path="/NewPassword/:ToValid" element={<NewPassValid/>} />
              <Route path='/Valid/:ToValid' element={<Valid/>}/>
              <Route path="terms" element={<Terms />} />
              <Route path="Privacy" element={<Privacy />} />

            </Route>


          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default Router