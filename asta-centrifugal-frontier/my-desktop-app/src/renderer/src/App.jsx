import { useState } from 'react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('userToken'))
  const [postContent, setPostContent] = useState('')
  const [error, setE] = useState(false)
  const [pass, setP] = useState("")
  const [user, setU] = useState("")
  const testpas = "password123"
  const testuser = "testuser"

  // --- Inline Styles Object ---
  const styles = {
    message: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      fontFamily: 'sans-serif',
      color: 'red',
      background: 'rgba(255, 255, 255, 0.1)', // Transparent white
      backdropFilter: 'blur(1px)',           // Frosted glass effect
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '50px',
      width: '200px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      borderRadius: '12px'
    },
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
      backdropFilter: 'blur(1px)',           // Frosted glass effect
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
    
    if(user === testuser && pass === testpas) {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      localStorage.setItem('userToken', mockToken)
      setToken(mockToken)
    } else {
      setE(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    setToken(null)
  }

  return (

    <div style={styles.container}>
      {error && <div style={styles.message}>Login failed. Please try again.</div>}
      {!token ? (
        /* LOGIN VIEW */
        <div style={styles.glassCard}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>Login</h2>
          <input type="text" placeholder="Username" value={user} onChange={(e) => setU(e.target.value)} style={styles.input} />
          <input type="password" placeholder="Password" value={pass} onChange={(e) => setP(e.target.value)} style={styles.input} />
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
