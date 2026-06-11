import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  on: (channel, callback) => {
    const allowed = ['hotspot-status', 'server-status']
    if (!allowed.includes(channel)) return
    const sub = (_, ...args) => callback(...args)
    ipcRenderer.on(channel, sub)
    // Return cleanup function
    return () => ipcRenderer.removeListener(channel, sub)
  }
})
