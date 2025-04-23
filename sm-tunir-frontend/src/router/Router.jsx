import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import protectedRoutes from "../constants/protectedRoutes"
import NotFound from '../pages/NotFound';
import App from '../apps/App';
import Auth from '../apps/auth'
import Login from '../pages/auth/Login';
import logo from "../assets/images/Logo smart farm1.jpg"
import SignUp from '../pages/auth/SignUp';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';


const fakeAuth = {
  isAuthenticated: false,
};
function Router() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (fakeAuth.isAuthenticated) {
        setUser({ name: 'Test User' });
      } else {
        setUser(false);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

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
              <Route index element={<Navigate to="/dashboard" />} />
              {protectedRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          ) : (
           
            <Route path="/" element={<Auth />}>
              <Route index element={<Login />} />
              <Route path="sign-up" element={<SignUp/>}/>
            </Route>
             
            
          )}
          <Route path="*" element={<NotFound />} />
          <Route path="terms" element={<Terms/>}/>
          <Route path="privacty" element={<Privacy/>}/>
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default Router