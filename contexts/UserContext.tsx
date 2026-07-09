'use client'

import { createContext, useContext, useState } from 'react'

type UserContextValue = {
  userId: string
  firstName: string
  setUser: (id: string, name: string) => void
}

const UserContext = createContext<UserContextValue>({
  userId: '',
  firstName: '',
  setUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId]     = useState('')
  const [firstName, setFirstName] = useState('')

  function setUser(id: string, name: string) {
    setUserId(id)
    setFirstName(name)
  }

  return (
    <UserContext.Provider value={{ userId, firstName, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
