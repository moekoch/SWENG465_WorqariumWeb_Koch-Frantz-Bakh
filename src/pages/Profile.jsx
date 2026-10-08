function Profile() {
  return (
    <main className="scene">
      <section
        className="card card-center profile-card"
        aria-labelledby="profile-heading"
      >
        <img
          className="profile-avatar"
          src="/src/assets/fish/blueTang.png"
          alt="Your Avatar"
        />
        <h1 id="profile-heading">Username</h1>
        <button type="button" className="btn-secondary">
          Edit 
        </button>
      </section>
    </main>
  )
}

export default Profile