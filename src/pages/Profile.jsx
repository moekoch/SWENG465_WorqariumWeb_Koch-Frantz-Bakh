import "./Profile.css"
import { useNavigate } from "react-router-dom"
import blueTang from "../assets/fish/blueTang.png"
import linedButterflyfish from "../assets/fish/linedButterflyfish.png"
import moorishIdol from "../assets/fish/moorishIdol.png"
import orangeClownfish from "../assets/fish/orangeClownfish.png"
import schoolingBannerfish from "../assets/fish/schoolingBannerfish.png"

const avatarImages = {
  blueTang,
  linedButterflyfish,
  moorishIdol,
  orangeClownfish,
  schoolingBannerfish,
}
const friends = [
  { username: "Friend1", avatar: "/src/assets/fish/linedButterflyfish.png" },
  { username: "Friend2", avatar: "/src/assets/fish/orangeClownfish.png" },
  { username: "Friend3", avatar: "/src/assets/fish/moorishIdol.png" },
]

function Profile() {
  const navigate = useNavigate()
  const selectedAvatar = localStorage.getItem("selectedAvatar")
  const avatarImage = avatarImages[selectedAvatar] ?? blueTang
  const avatarColor = localStorage.getItem("selectedAvatarColor") ?? "#ffffff"

  return (
    <main className="scene">
      <section
        className="card card-center profile-card"
        aria-labelledby="profile-heading"
      >
        <div className="profile-summary">
          <div className="profile-avatar-group">
            <div className="profile-avatar-preview">
              <img
                className="profile-avatar"
                src={avatarImage}
                alt="Your Avatar"
              />
              <span
                className="profile-avatar-tint"
                style={{
                  backgroundColor: avatarColor,
                  WebkitMaskImage: `url("${avatarImage}")`,
                  maskImage: `url("${avatarImage}")`,
                }}
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/avatar")}
            >
              Edit
            </button>
          </div>
          <div className="profile-info-group">
            <h1 id="profile-heading">Username</h1>
            <h2 id="profile-subheading">Email@email.com</h2>
          </div>
        </div>
        <section className="profile-friends" aria-labelledby="friends-heading">
          <h2 id="friends-heading">Friends</h2>
          <ul className="profile-friends-list">
            {friends.map((friend) => (
              <li className="profile-friend" key={friend.username}>
                <span className="profile-friend-name">{friend.username}</span>
                <img
                  className="profile-friend-avatar"
                  src={friend.avatar}
                  alt={friend.username}
                />
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  )
}

export default Profile