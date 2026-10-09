import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL = "http://localhost:3000"

function Login() {
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    // stop the browser from reloading the page
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()

      if (res.ok) {
        // go to JoinSession after logging in
        navigate("/join-session")
        return
      }

      // no account matches: ask before creating one
      if (res.status === 404 && data.code === "ACCOUNT_NOT_FOUND") {
        dialogRef.current.showModal()
        return
      }

      setError(data.error || "Login failed")
    } catch {
      setError("Could not reach the server")
    }
  }

  async function createAccount() {
    dialogRef.current.close()
    setError("")

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Could not create account")
        return
      }

      // new account is ready, so continue to JoinSession
      navigate("/join-session")
    } catch {
      setError("Could not reach the server")
    }
  }

  return (
    <main className="scene">
      <section className="card card-center" aria-labelledby="login-heading">
        <h1 id="login-heading">Login</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" className="btn-primary">
            Log in
          </button>
        </form>
      </section>

      {/* confirmation popup (Esc also closes it) */}
      <dialog ref={dialogRef} className="dialog" aria-labelledby="confirm-heading">
        <h2 id="confirm-heading">Create a new account?</h2>
        <p>
          No account was found for <strong>{username}</strong> ({email}).
          Would you like to create one with these details?
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => dialogRef.current.close()}
          >
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={createAccount}>
            Create account
          </button>
        </div>
      </dialog>
    </main>
  )
}

export default Login