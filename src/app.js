import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/error.middlewares.js'
import swaggerUi from 'swagger-ui-express'
import session from 'express-session'
import fs from 'fs'
import passport from 'passport'
import path from 'path'
import YAML from 'yaml'
import { fileURLToPath } from 'url'
import { rateLimit } from 'express-rate-limit'
import todoRouter from './routes/todo.routes.js'
import userRouter from './routes/user.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const file = fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    )
  },
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public')) // configure static file to save images locally
app.use(cookieParser())

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions

// * App apis
app.use('/api/v1/users', userRouter)

app.use('/api/v1/todos', todoRouter)

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'none', // keep all the sections collapsed by default
    },
    customSiteTitle: 'TodoAPI docs',
  })
)

// common error handling middleware
app.use(errorHandler)

export { app }
