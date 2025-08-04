import React from 'react'
import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100'>
      <Outlet />
      {/* The Outlet component will render the child routes inside this layout */}  

    </div>
  )
}

export default AuthLayout