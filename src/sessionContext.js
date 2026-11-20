import { createContext, useContext } from 'react'

// live session state shared by every page (see SessionProvider.jsx)
export const SessionContext = createContext(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <SessionProvider>')
  return session
}
