import Database from 'better-sqlite3'

export async function initSchema(db: Database.Database) {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run()

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER,
      name TEXT,
      method TEXT NOT NULL,
      url TEXT NOT NULL,
      headers TEXT,      -- store JSON string
      body TEXT,         -- store JSON string or raw
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )
  `
  ).run()

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run()

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS variables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      environment_id INTEGER,
      key TEXT NOT NULL,
      value TEXT,
      FOREIGN KEY(environment_id) REFERENCES environments(id) ON DELETE CASCADE
    )
  `
  ).run()

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      status_code INTEGER,
      response_time INTEGER,
      response_body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE SET NULL
    )
  `
  ).run()
}

export function collectionDao(ipcMain: Electron.IpcMain, db: Database.Database) {
  ipcMain.handle(
    'db:add-collection',
    (
      _event,
      request: {
        name: string
      }
    ) => {
      const stmt = db.prepare('INSERT INTO collections (name) VALUES (?)')
      const info = stmt.run(request.name)
      return { id: info.lastInsertRowid }
    }
  )

  ipcMain.handle('db:get-collections', (_event) => {
    const stmt = db.prepare('SELECT * FROM collections')
    const collections = stmt.all()
    return collections as Array<{ id: number; name: string; created_at: string }>
  })

  ipcMain.handle(
    'db:update-collection',
    (
      _event,
      request: {
        id: number
        name?: string
      }
    ) => {
      const updates: string[] = []
      const values: any[] = []

      if (request.name !== undefined) {
        updates.push('name = ?')
        values.push(request.name)
      }

      if (updates.length === 0) return { changes: 0 }

      const stmt = db.prepare(`UPDATE collections SET ${updates.join(', ')} WHERE id = ?`)
      values.push(request.id)
      const info = stmt.run(...values)
      return { changes: info.changes }
    }
  )

  ipcMain.handle('db:delete-collection', (_event, collectionId: number) => {
    const stmt = db.prepare('DELETE FROM collections WHERE id = ?')
    const info = stmt.run(collectionId)
    return { changes: info.changes }
  })
}

export function requestDao(ipcMain: Electron.IpcMain, db: Database.Database) {
  ipcMain.handle(
    'db:add-request',
    (
      _event,
      request: {
        collection_id: number
        name: string
        method: string
        url: string
        headers?: string
        body?: string
      }
    ) => {
      const stmt = db.prepare(
        'INSERT INTO requests (collection_id, name, method, url, headers, body) VALUES (?, ?, ?, ?, ?, ?)'
      )
      const info = stmt.run(
        request.collection_id,
        request.name,
        request.method,
        request.url,
        request.headers || null,
        request.body || null
      )
      return { id: info.lastInsertRowid }
    }
  )

  ipcMain.handle('db:get-requests', (_event, collectionId: number) => {
    const stmt = db.prepare('SELECT * FROM requests WHERE collection_id = ?')
    const requests = stmt.all(collectionId)
    return requests as Array<{
      id: number
      collection_id: number
      name: string
      method: string
      url: string
      headers: string | null
      body: string | null
      created_at: string
    }>
  })

  ipcMain.handle(
    'db:update-request',
    (
      _event,
      request: {
        id: number
        name?: string
        method?: string
        url?: string
        headers?: string
        body?: string
      }
    ) => {
      const updates: string[] = []
      const values: any[] = []

      if (request.name !== undefined) {
        updates.push('name = ?')
        values.push(request.name)
      }
      if (request.method !== undefined) {
        updates.push('method = ?')
        values.push(request.method)
      }
      if (request.url !== undefined) {
        updates.push('url = ?')
        values.push(request.url)
      }
      if (request.headers !== undefined) {
        updates.push('headers = ?')
        values.push(request.headers)
      }
      if (request.body !== undefined) {
        updates.push('body = ?')
        values.push(request.body)
      }

      if (updates.length === 0) return { changes: 0 }

      const stmt = db.prepare(`UPDATE requests SET ${updates.join(', ')} WHERE id = ?`)
      values.push(request.id)
      const info = stmt.run(...values)
      return { changes: info.changes }
    }
  )

  ipcMain.handle('db:delete-request', (_event, requestId: number) => {
    const stmt = db.prepare('DELETE FROM requests WHERE id = ?')
    const info = stmt.run(requestId)
    return { changes: info.changes }
  })
}
