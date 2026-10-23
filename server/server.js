import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jsonServer from 'json-server'
import jwt from 'jsonwebtoken'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3000)
const JWT_SECRET = 'dev-only-secret-change-me'
const TOKEN_TTL = '1h'
const ROLE_PERMISSIONS = {
  admin: ['dashboard:view', 'users:read', 'users:write', 'reports:read', 'settings:manage'],
  manager: ['dashboard:view', 'users:read', 'reports:read'],
  user: ['dashboard:view'],
}

// Keep in sync with src/config/permissions.ts (the API is the source of truth)

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))

server.use(jsonServer.defaults()) // logger, CORS, static, no-cache
server.use(jsonServer.bodyParser)

const getUsers = () => router.db.get('users').value()
const toPublic = ({ password: _password, ...user }) => user

// ---------- helpers ----------
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing token' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = getUsers().find((u) => String(u.id) === String(payload.sub))
    if (!user) return res.status(401).json({ message: 'User no longer exists' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const requirePermission = (permission) => (req, res, next) => {
  if (!ROLE_PERMISSIONS[req.user.role]?.includes(permission)) {
    return res.status(403).json({ message: 'You do not have permission to do that' })
  }
  next()
}

// ---------- public routes ----------
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const user = getUsers().find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL })
  res.json({ token, user: toPublic(user) })
})

// ---------- everything below requires a valid token ----------
server.get('/auth/me', authenticate, (req, res) => res.json(toPublic(req.user)))

server.use(authenticate)

server.use(router)

server.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
