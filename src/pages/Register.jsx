import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL = "http://localhost:3000"

function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    // stop the browser from reloading the page
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      // go to JoinSession after logging in
        navigate("/join-session")
    } catch {
      setError("Could not reach the server")
    }
  }

  return (
    <main className="scene">
      <section className="card card-center" aria-labelledby="login-heading">
        <h1 id="login-heading">Register</h1>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <p className="form-link">
            Already have an account? <Link to="/">Log In</Link>
          </p>

          {error && <p className="error-msg" role="alert">ⓧ {error}</p>}

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>
      </section>
    </main>
  )
}

export default Register