import "./Profile.css"
import { useNavigate } from "react-router-dom"
import { getFishImage } from "../fishImages.js"
import { useFriends } from "../friends.js"
import { useSession } from "../sessionContext.js"
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

function Profile() {
  const navigate = useNavigate()
  const friends = useFriends()
  const { self } = useSession()
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
              onClick={() => navigate("/tank")}
            >
              Edit
            </button>
          </div>
          <div className="profile-info-group">
            <h1 id="profile-heading">{self?.username ?? "Username"}</h1>
            <h2 id="profile-subheading">Email@email.com</h2>
          </div>
        </div>
        <section className="profile-friends" aria-labelledby="friends-heading">
          <h2 id="friends-heading">Friends</h2>
          <ul className="profile-friends-list">
            {friends.map((friend) => (
              <li className="profile-friend" key={friend.id ?? friend.username}>
                <span className="profile-friend-name">
                  {friend.username} · {friend.online ? "Online" : "Offline"}
                </span>
                <img
                  className="profile-friend-avatar"
                  src={getFishImage(friend.avatarKey)}
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