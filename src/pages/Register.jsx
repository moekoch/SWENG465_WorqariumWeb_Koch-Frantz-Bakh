import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_URL } from "../api.js"
import AmbientBubbles from "../components/AmbientBubbles.jsx"
import { environmentStyle } from "../environmentImages.js"
import "./Auth.css"

function Register() {
  const navigate = useNavigate()

  // form field values
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // error messages
  const [error, setError] = useState("")

  // true while waiting for the server
  const [submitting, setSubmitting] = useState(false)

  // run when form submitted
  async function handleSubmit(e) {
    // stop the browser from reloading the page
    e.preventDefault()

    // clear previous errors
    setError("")
    setSubmitting(true)

    try {
      // send new user's info to server
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()

      // check for errors in server response
      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      // go to login after registering
      navigate("/")
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

      <section className="auth-card" aria-labelledby="register-heading">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true" />
          Worqarium
        </div>

        <div>
          <h1 id="register-heading">Make a little home.</h1>
          <p className="auth-intro">Create an account to get your own fish and tank.</p>
        </div>

        {/* registration form */}
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

          {/* error message */}
          {error && <p className="auth-error" role="alert">{error}</p>}

          {/* submission button */}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting && (
              <span className="auth-bubbles" aria-hidden="true"><i /><i /><i /></span>
            )}
            {submitting ? "Creating…" : "Create account"}
          </button>

          {/* go to login */}
          <p className="form-link">
            Already have an account? <Link to="/">Log in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Register
