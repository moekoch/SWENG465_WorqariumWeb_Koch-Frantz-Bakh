import { useNavigate } from "react-router-dom"

function JoinSession({ onJoin }) {
  const navigate = useNavigate()

  return (
    <main className="scene">
      <section className="card card-center" aria-labelledby="join-heading">
        <h1 id="join-heading">
          Ready to join
          <br />a session?
        </h1>
        <button type="button" className="btn-primary" onClick={() => navigate("/session")}>
          Dive in!
        </button>
      </section>
    </main>
  )
}

export default JoinSession