import { useRef, useState } from 'react'
import { IoPaperPlaneOutline } from 'react-icons/io5'
import { useSession } from '../sessionContext.js'
import './ChatBar.css'

// longest message allowed (the server cuts to the same length)
const MAX_MESSAGE_LENGTH = 120

// Room chat above the dock. Messages show as speech bubbles over fish on the
// map, and the newest one is also written here so it can be read on any page.
function ChatBar() {
  const { latestMessage, sendChat, connected } = useSession()

  // what the user is typing
  const [draft, setDraft] = useState('')

  // true while waiting for the server, and a note if it said no
  const [sending, setSending] = useState(false)
  const [note, setNote] = useState('')

  const inputRef = useRef(null)

  const handleSubmit = async (event) => {
    // stop the browser from reloading the page
    event.preventDefault()

    const message = draft.replace(/\s+/g, ' ').trim()
    if (!message || sending) return

    setSending(true)
    setNote('')
    const result = await sendChat(message)
    setSending(false)

    if (result.ok) setDraft('')
    else setNote(result.error ?? 'Could not send that.')

    // keep typing without clicking back in
    inputRef.current?.focus()
  }

  return (
    <section className="chat-bar" aria-label="Room chat">
      {/* newest message (or a note if sending failed), read out politely */}
      <p className={`chat-latest${note ? ' is-note' : ''}`} role="log" aria-live="polite">
        {note ||
          (latestMessage
            ? `${latestMessage.username}: ${latestMessage.text}`
            : 'Nobody has said anything yet. Say hello!')}
      </p>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="chat-field">
          <span>Message the room</span>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Say hello…"
            autoComplete="off"
            onChange={(event) => {
              setDraft(event.target.value)
              setNote('')
            }}
          />
        </label>

        <button type="submit" className="chat-send" disabled={!draft.trim() || sending || !connected}>
          <IoPaperPlaneOutline size={20} aria-hidden="true" />
          Send
        </button>
      </form>
    </section>
  )
}

export default ChatBar
