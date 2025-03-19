import React from 'react'
import UsersList from './UsersList'
import Permission from '../components/layout/Permission'

const AdminBoard = () => {

    let role = JSON.parse(localStorage.getItem("user")).role

    const Gestion = () => {
        switch (role) {
          case "ROLE_ADMIN":
            return  <UsersList /> 
          case "ROLE_USER":
            return <Permission />
            case "ROLE_SUPPLIER":
            return <Permission />
          default:
            return 
        }
      };

  return (
    <>
        {Gestion()}
    </>
  )
}

export default AdminBoard