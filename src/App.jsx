import { useState } from 'react'

const candidates = [
  {
    id: 'tinubu',
    name: 'Bola Ahmed Tinubu',
    party: 'APC',
    initials: 'BT',
    color: 'green',
    description: 'President of Nigeria and the All Progressives Congress candidate option.',
  },
  {
    id: 'obi',
    name: 'Peter Obi',
    party: 'ADC',
    initials: 'PO',
    color: 'blue',
    description: 'Former governor of Anambra State and the African Democratic Congress candidate option.',
  },
  {
    id: 'atiku',
    name: 'Atiku Abubakar',
    party: 'PDP',
    initials: 'AA',
    color: 'red',
    description: 'Former vice president of Nigeria and the Peoples Democratic Party candidate option.',
  },
]

const STORAGE_KEY = 'nigeria-2027-local-poll'

function readPoll() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (
      saved &&
      typeof saved === 'object' &&
      candidates.some((candidate) => candidate.id === saved.choice) &&
      typeof saved.votes === 'object'
    ) {
      const votes = Object.fromEntries(
        candidates.map((candidate) => [
          candidate.id,
          Number.isSafeInteger(saved.votes[candidate.id]) && saved.votes[candidate.id] >= 0
            ? saved.votes[candidate.id]
            : 0,
        ]),
      )
      return { choice: saved.choice, votes }
    }
  } catch {
    // Invalid or unavailable local storage should not prevent the poll from loading.
  }

  return { choice: null, votes: Object.fromEntries(candidates.map(({ id }) => [id, 0])) }
}

function Icon({ name, size = 18 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'arrow') {
    return <svg {...shared}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  }
  if (name === 'check') {
    return <svg {...shared}><path d="m5 12 4 4L19 6" /></svg>
  }
  if (name === 'lock') {
    return <svg {...shared}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
  }
  if (name === 'chart') {
    return <svg {...shared}><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></svg>
  }
  return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
}

function App() {
  const [poll, setPoll] = useState(readPoll)
  const [selected, setSelected] = useState(poll.choice)
  const [message, setMessage] = useState('')
  const hasVoted = poll.choice !== null
  const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0)

  function castVote(event) {
    event.preventDefault()
    if (hasVoted) {
      setMessage('A vote has already been recorded in this browser.')
      return
    }
    if (!selected) {
      setMessage('Choose a candidate before submitting your preference.')
      return
    }

    const nextPoll = {
      choice: selected,
      votes: { ...poll.votes, [selected]: poll.votes[selected] + 1 },
    }
    setPoll(nextPoll)
    setMessage('')
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPoll))
    } catch {
      setMessage('Your choice is shown for this visit, but could not be saved in this browser.')
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Nigeria Decides home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Nigeria<span className="brand-light">Decides</span><small>2027 OPINION POLL</small></span>
        </a>
        <a className="top-link" href="#how-it-works">About this poll <Icon name="arrow" size={15} /></a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> YOUR VOICE IN THE CONVERSATION</div>
            <h1>Your vote.<br />Your <span>voice.</span></h1>
            <p className="hero-intro">
              If the 2027 presidential election were held today, who would get your vote?
              Make your choice and see this browser’s poll results.
            </p>
            <div className="hero-meta">
              <span><Icon name="lock" size={16} /> Private on this device</span>
              <span className="meta-divider" />
              <span><Icon name="chart" size={17} /> Live local results</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun-disc" />
            <div className="art-number">27</div>
            <div className="art-caption">THE FUTURE<br />IS A CHOICE</div>
            <div className="art-lines"><span /><span /><span /><span /><span /></div>
            <div className="art-stamp">YOUR<br />VOICE<br /><b>COUNTS</b></div>
          </div>
        </section>

        <section className="poll-section" id="vote">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">THE QUESTION</div>
              <h2>Who has your support?</h2>
            </div>
            <span className="poll-tag">UNOFFICIAL POLL</span>
          </div>

          {hasVoted && (
            <div className="success-banner" role="status">
              <span className="success-icon"><Icon name="check" size={17} /></span>
              <span><strong>Your preference is recorded.</strong> Results below reflect votes saved in this browser only.</span>
            </div>
          )}

          <form onSubmit={castVote}>
            <div className="candidate-list" role="radiogroup" aria-label="Choose your preferred candidate">
              {candidates.map((candidate, index) => {
                const isSelected = selected === candidate.id
                const count = poll.votes[candidate.id]
                const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100)

                return (
                  <label
                    className={`candidate-card ${isSelected ? 'is-selected' : ''} ${hasVoted ? 'has-results' : ''}`}
                    key={candidate.id}
                  >
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelected(candidate.id)
                        setMessage('')
                      }}
                      disabled={hasVoted}
                    />
                    <span className={`candidate-avatar ${candidate.color}`} aria-hidden="true">
                      <span>{candidate.initials}</span><i>{String(index + 1).padStart(2, '0')}</i>
                    </span>
                    <span className="candidate-info">
                      <span className="candidate-name">{candidate.name}</span>
                      <span className="candidate-detail">{candidate.description}</span>
                    </span>
                    <span className={`party-pill ${candidate.color}`}>{candidate.party}</span>
                    {hasVoted ? (
                      <span className="result-value">{percentage}%<small>{count} {count === 1 ? 'vote' : 'votes'}</small></span>
                    ) : (
                      <span className={`radio-indicator ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                        {isSelected && <Icon name="check" size={14} />}
                      </span>
                    )}
                    {hasVoted && (
                      <span className="result-track" aria-hidden="true">
                        <span style={{ width: `${percentage}%` }} />
                      </span>
                    )}
                  </label>
                )
              })}
            </div>

            {!hasVoted && (
              <div className="form-footer">
                <div className="form-note"><Icon name="info" size={17} /> One preference per browser. No personal details required.</div>
                <button className="vote-button" type="submit">Cast my vote <Icon name="arrow" size={17} /></button>
              </div>
            )}
            {message && <p className="form-message" role="alert">{message}</p>}
          </form>

          {hasVoted && (
            <div className="results-footer">
              <span><Icon name="chart" size={17} /> {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} on this browser</span>
              <span>Not a national poll</span>
            </div>
          )}
        </section>

        <section className="trust-strip" id="how-it-works">
          <div className="trust-icon"><Icon name="info" size={20} /></div>
          <div>
            <h3>Just a conversation starter.</h3>
            <p>This is an independent, unofficial opinion poll—not an election, a scientific survey, or an INEC service. Your selection is saved only in your browser and is not sent to a server or combined with anyone else’s votes.</p>
          </div>
          <div className="nigeria-colors" aria-label="Nigerian flag colors"><span /><span /><span /></div>
        </section>
      </main>

      <footer className="footer">
        <span>Made for a more engaged Nigeria.</span>
        <span className="footer-right">2027 · YOUR VOICE MATTERS</span>
      </footer>
    </div>
  )
}

export default App
