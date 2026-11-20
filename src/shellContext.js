import { createContext, useContext } from 'react'

// lets any page open or close the right-side Friends panel
export const ShellContext = createContext({
  friendsOpen: false,
  setFriendsOpen: () => {},
})

export const useShell = () => useContext(ShellContext)
