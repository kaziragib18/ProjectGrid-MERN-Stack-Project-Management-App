import { Button } from '@/components/ui/button';
import { useAuth } from '@/provider/auth-context';
import React from 'react'

const DashboardLayout = () => {
 const {user, logout} = useAuth(); // Accessing user and logout function from AuthContext
  return (
    <div>
      <Button onClick={logout} className="bg-red-500 text-white">
        Logout
      </Button>
      <h1 className="text-2xl font-bold">Welcome to the Dashboard, {user?.name || 'User'}!</h1>
      {/* Additional dashboard content can go here */}  
    </div>
  )
}

export default DashboardLayout