import { useState } from 'react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('userToken'))
  const [postContent, setPostContent] = useState('')

  // --- Inline Styles Object ---
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      color: 'white'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.1)', // Transparent white
      backdropFilter: 'blur(12px)',           // Frosted glass effect
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '24px',                   // Smooth rounded corners
      padding: '40px',
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    },
    input: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      padding: '12px',
      color: 'white',
      outline: 'none'
    },
    button: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
      padding: '12px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: '0.2s'
    }
  }

  const handleLogin = () => {
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    localStorage.setItem('userToken', mockToken)
    setToken(mockToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    setToken(null)
  }

  return (
    <div style={styles.container}>
      {!token ? (
        /* LOGIN VIEW */
        <div style={styles.glassCard}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>Login</h2>
          <input type="text" placeholder="Username" style={styles.input} />
          <input type="password" placeholder="Password" style={styles.input} />
          <button onClick={handleLogin} style={styles.button}>Sign In</button>
        </div>
      ) : (
        /* POST VIEW */
        <div style={styles.glassCard}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>Create Post</h2>
          <textarea 
            placeholder="What's happening?" 
            style={{ ...styles.input, minHeight: '100px', resize: 'none' }}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <button style={styles.button}>Post to Server</button>
          <button 
            onClick={handleLogout} 
            style={{ ...styles.button, background: 'transparent', border: 'none', fontSize: '12px' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default App
