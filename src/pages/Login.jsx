import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// base URL of server
const API_URL = "http://localhost:3000"

function Login() {
  const navigate = useNavigate()

  // form field values
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    // stop the browser from reloading the page
    e.preventDefault()

    // clear previous errors
    setError("")

    try {
      // send user's info to server
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      // check for erros in server response
      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      // go to main screen after logging in
      navigate("/join-session")
    } catch {
      // network failure or server down
      setError("Could not reach the server")
    }
  }

  return (
    <main className="scene">
      {/* aria for screen reader accouncing section */}
      <section className="card card-center" aria-labelledby="login-heading">

        {/* title above form */}
        <h1 id="login-heading">Login</h1>

        {/* login form */}
        <form className="form" onSubmit={handleSubmit}>

          {/* username section */}
          <div className="field">
            {/* username label */}
            <label htmlFor="username">Username</label>
            {/* username input */}
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* password section */}
          <div className="field">
            {/* password label */}
            <label htmlFor="password">Password</label>
            {/* password input */}
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* go to registration */}
          <p className="form-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          {/* error message */}
          {error && <p className="error-msg" role="alert">ⓧ {error}</p>}

          {/* submission button */}
          <button type="submit" className="btn-primary">Log in</button>
        </form>
      </section>
    </main>
  )
}

export default Login