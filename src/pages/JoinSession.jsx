import { useNavigate } from "react-router-dom"

function JoinSession({ onJoin }) {
  const navigate = useNavigate()

  return (
    <main className="scene">
      {/* aria for screen reader accouncing section */}
      <section className="card card-center" aria-labelledby="join-heading">

        {/* join prompt matches aria */}
        <h1 id="join-heading">
          Ready to join
          <br />a session?
        </h1>

        {/* button to active session */}
        <button type="button" className="btn-primary" onClick={() => navigate("/active-session")}>
          Dive in!
        </button>
      </section>
    </main>
  )
}

export default JoinSession