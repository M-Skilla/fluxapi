import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  getCollections: () => ipcRenderer.invoke('db:get-collections'),
  addCollection: (data: { name: string }) => ipcRenderer.invoke('db:add-collection', data),
  updateCollection: (data: { id: number; name?: string }) =>
    ipcRenderer.invoke('db:update-collection', data),
  deleteCollection: (collectionId: number) =>
    ipcRenderer.invoke('db:delete-collection', collectionId),
  getRequests: (collectionId: number) => ipcRenderer.invoke('db:get-requests', collectionId),
  addRequest: (data: any) => ipcRenderer.invoke('db:add-request', data),
  updateRequest: (data: any) => ipcRenderer.invoke('db:update-request', data),
  deleteRequest: (requestId: number) => ipcRenderer.invoke('db:delete-request', requestId)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
