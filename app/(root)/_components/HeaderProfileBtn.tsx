"use client"
import LoginButton from '@/components/LoginButton'
import { SignedOut, UserButton } from '@clerk/nextjs'
import { User } from 'lucide-react'
import React from 'react'

const HeaderProfileBtn = () => {
  return (
    <div>
      <UserButton>
        <UserButton.MenuItems>
            <UserButton.Link  labelIcon={<User className='size-4'/>}
            label='Profile' href='/profile'/>
        </UserButton.MenuItems>
      </UserButton>

      <SignedOut>
        <LoginButton/>
      </SignedOut>
    </div>
  )
}

export default HeaderProfileBtn
