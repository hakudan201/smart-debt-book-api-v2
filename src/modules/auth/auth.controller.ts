import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

interface RegisterBody {
  email: string
  password: string
  fullname: string
}

interface LoginBody {
  email: string
  password: string
}

interface AuthController {
  register: (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => Promise<{
    accessToken: string
    user: { id: number; email: string; fullname: string }
  } | { message: string }>
  login: (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => Promise<{
    accessToken: string
    refreshToken: string
    user: { id: number; email: string; fullname: string }
  } | { message: string }>
  getProfile: (request: FastifyRequest, reply: FastifyReply) => Promise<{
    userId: number
    email: string
    emailVerified: boolean
  } | { message: string }>
  refresh: (request: FastifyRequest, reply: FastifyReply) => Promise<{
    accessToken: string
    user: { id: number; email: string; fullname: string }
  } | { message: string }>
  logout: (request: FastifyRequest, reply: FastifyReply) => Promise<{ message: string }>
}

/**
 * Auth Controller - Handles HTTP requests and responses
 */
export default function createAuthController(fastify: FastifyInstance): AuthController {
  const authService = fastify.authService

  /**
   * Register a new user
   */
  async function register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    const { email, password, fullname } = request.body

    // Basic validation
    if (!email || !password || !fullname) {
      reply.code(400)
      return { message: 'Email, password, and fullname are required' }
    }

    try {
      // Register user
      await authService.registerUser(email, password, fullname)

      // Auto-login after registration
      const authResponse = await authService.loginUser(email, password)

      // Set refresh token as httpOnly cookie
      if (authResponse.refreshToken) {
        reply.setCookie('refreshToken', authResponse.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/'
        })
      }

      reply.code(201)
      return {
        accessToken: authResponse.accessToken,
        user: authResponse.user
      }
    } catch (error) {
      const err = error as Error
      if (err.message === 'User with this email already exists') {
        reply.code(409)
        return { message: err.message }
      }
      if (err.message.includes('Password must') || err.message === 'Invalid email format') {
        reply.code(400)
        return { message: err.message }
      }
      reply.code(500)
      return { message: 'Internal server error' }
    }
  }

  /**
   * Login user
   */
  async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body

    if (!email || !password) {
      reply.code(400)
      return { message: 'Email and password are required' }
    }

    try {
      const authResponse = await authService.loginUser(email, password)

      return {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user
      }
    } catch (error) {
      const err = error as Error
      if (err.message === 'Invalid credentials') {
        reply.code(401)
        return { message: err.message }
      }
      reply.code(500)
      return { message: 'Internal server error' }
    }
  }

  /**
   * Get current user profile (protected)
   */
  async function getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { sub: number; email: string }
      const userId = user.sub
      const profile = await authService.getUserProfile(userId)
      return profile
    } catch (error) {
      const err = error as Error
      if (err.message === 'User not found') {
        reply.code(404)
        return { message: err.message }
      }
      reply.code(500)
      return { message: 'Internal server error' }
    }
  }

  /**
   * Refresh access token
   */
  async function refresh(request: FastifyRequest, reply: FastifyReply) {
    // Read refresh token from cookie
    const refreshToken = request.cookies?.refreshToken as string | undefined

    if (!refreshToken) {
      reply.code(401)
      return { message: 'No refresh token' }
    }

    try {
      const authResponse = await authService.refreshToken(refreshToken)

      // Set new refresh token cookie (if rotating)
      if (authResponse.refreshToken) {
        reply.setCookie('refreshToken', authResponse.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/'
        })
      }

      return {
        accessToken: authResponse.accessToken,
        user: authResponse.user
      }
    } catch (error) {
      const err = error as Error
      if (err.message === 'Invalid refresh token' || err.message === 'User not found') {
        reply.code(401)
        return { message: err.message }
      }
      reply.code(500)
      return { message: 'Internal server error' }
    }
  }

  /**
   * Logout user
   */
  async function logout(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies?.refreshToken as string | undefined

    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (error) {
        console.error(error)
      }
    }

    // Clear the refresh token cookie
    reply.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return { message: 'Logged out successfully' }
  }

  return {
    register,
    login,
    getProfile,
    refresh,
    logout
  }
}

