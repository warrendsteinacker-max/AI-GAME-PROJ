import { useEffect, useState } from 'react'

export default function App() {
  const [hotspot, setHotspot] = useState({ status: 'starting', ssid: 'MyDesktopAppHotspot', pass: 'Password123' })
  const [server, setServer]   = useState({ status: 'starting', ip: '...', port: 3000 })
  const [log, setLog]         = useState([])

  const addLog = (msg) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50))

  useEffect(() => {
    // Listen for events from main process via preload bridge
    const off1 = window.api?.on('hotspot-status', (data) => {
      setHotspot(prev => ({ ...prev, ...data }))
      addLog(`Hotspot: ${data.status}`)
    })
    const off2 = window.api?.on('server-status', (data) => {
      setServer(prev => ({ ...prev, ...data }))
      addLog(`Server: ${data.status} — https://${data.ip}:${data.port}`)
    })

    // Fallback: poll the server directly after 3s
    const timer = setTimeout(() => {
      fetch('https://localhost:3000/api/ping', { mode: 'no-cors' })
        .then(() => {
          setServer({ status: 'online', ip: '192.168.137.1', port: 3000 })
          addLog('Server confirmed online')
        })
        .catch(() => addLog('Server ping failed — check certs'))
    }, 3000)

    addLog('App starting up...')
    return () => { clearTimeout(timer); off1?.(); off2?.() }
  }, [])

  const statusColor = (s) => s === 'online' || s === 'active' ? '#16a34a' : s === 'starting' ? '#d97706' : '#dc2626'
  const dot = (s) => ({ display:'inline-block', width:10, height:10, borderRadius:'50%', background: statusColor(s), marginRight:8 })

  return (
    <div style={{ fontFamily:'system-ui,sans-serif', background:'#0f172a', minHeight:'100vh', color:'#e2e8f0', padding:24 }}>
      <h1 style={{ margin:'0 0 4px', fontSize:22, color:'#fff' }}>MyDesktopApp</h1>
      <p style={{ margin:'0 0 24px', color:'#64748b', fontSize:13 }}>Local Network Server — Desktop Control Panel</p>

      {/* Status Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>

        <div style={{ background:'#1e293b', borderRadius:10, padding:20, border:'1px solid #334155' }}>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Hotspot</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>
            <span style={dot(hotspot.status)} />
            {hotspot.status === 'active' ? 'Broadcasting' : hotspot.status === 'starting' ? 'Starting...' : 'Off'}
          </div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>SSID: <b style={{color:'#fff'}}>{hotspot.ssid}</b></div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>Pass: <b style={{color:'#fff'}}>{hotspot.pass}</b></div>
        </div>

        <div style={{ background:'#1e293b', borderRadius:10, padding:20, border:'1px solid #334155' }}>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>HTTPS Server</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>
            <span style={dot(server.status)} />
            {server.status === 'online' ? 'Online' : 'Starting...'}
          </div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>Port: <b style={{color:'#fff'}}>{server.port}</b></div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>IP: <b style={{color:'#38bdf8'}}>192.168.137.1</b></div>
        </div>
      </div>

      {/* Phone connection instructions */}
      <div style={{ background:'#1e293b', borderRadius:10, padding:20, border:'1px solid #334155', marginBottom:24 }}>
        <div style={{ fontSize:12, color:'#64748b', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>Connect a Phone</div>
        <ol style={{ margin:0, paddingLeft:20, color:'#94a3b8', fontSize:14, lineHeight:2 }}>
          <li>Connect phone to Wi-Fi: <b style={{color:'#fff'}}>MyDesktopAppHotspot</b> / <b style={{color:'#fff'}}>Password123</b></li>
          <li>Open browser and go to: <b style={{color:'#38bdf8'}}>https://192.168.137.1:3000</b></li>
          <li>Tap <b style={{color:'#fff'}}>Advanced → Proceed</b> past the cert warning</li>
          <li>Optionally: tap Share → <b style={{color:'#fff'}}>Add to Home Screen</b> for PWA icon</li>
        </ol>
      </div>

      {/* Log */}
      <div style={{ background:'#1e293b', borderRadius:10, padding:20, border:'1px solid #334155' }}>
        <div style={{ fontSize:12, color:'#64748b', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>Activity Log</div>
        <div style={{ fontFamily:'monospace', fontSize:12, color:'#4ade80', maxHeight:160, overflowY:'auto' }}>
          {log.length === 0 ? <div style={{color:'#475569'}}>No events yet...</div> : log.map((l,i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  )
}