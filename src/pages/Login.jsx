import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { setToken, API_URL } from "../api.js"
import AmbientBubbles from "../components/AmbientBubbles.jsx"
import { environmentStyle } from "../environmentImages.js"
import "./Auth.css"

function Login() {
  const navigate = useNavigate()

  // form field values
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // true while waiting for the server
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    // stop the browser from reloading the page
    e.preventDefault()

    // clear previous errors
    setError("")
    setSubmitting(true)

    try {
      // send user's info to server
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      // check for errors in server response
      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      // save the login token so later requests can send it
      setToken(data.token)

      // go to the map after logging in
      navigate("/map")
    } catch {
      // network failure or server down
      setError("Could not reach the server")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-scene environment env-map" style={environmentStyle("mapBackground")}>
      <AmbientBubbles />

      {/* aria for screen reader announcing section */}
      <section className="auth-card" aria-labelledby="login-heading">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true" />
          Worqarium
        </div>

        <div>
          {/* title above form */}
          <h1 id="login-heading">Welcome back.</h1>
          <p className="auth-intro">Your space, your pace. Dive back in.</p>
        </div>

        {/* login form */}
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

          {/* error message */}
          {error && <p className="auth-error" role="alert">{error}</p>}

          {/* submission button */}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting && (
              <span className="auth-bubbles" aria-hidden="true"><i /><i /><i /></span>
            )}
            {submitting ? "Diving in…" : "Log in"}
          </button>

          {/* go to registration */}
          <p className="form-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
