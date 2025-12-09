import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'

interface AuthService {
  registerUser: (email: string, password: string, fullname: string) => Promise<{
    id: number
    email: string
    fullname: string
    emailVerified: boolean
    createdAt: Date
  }>
  loginUser: (email: string, password: string) => Promise<{
    accessToken: string
    refreshToken: string
    user: {
      id: number
      email: string
      fullname: string
    }
  }>
  refreshToken: (refreshToken: string) => Promise<{
    accessToken: string
    refreshToken: string
    user: {
      id: number
      email: string
      fullname: string
    }
  }>
  logout: (refreshToken: string) => Promise<void>
  getUserProfile: (userId: number) => Promise<{
    userId: number
    email: string
    emailVerified: boolean
  }>
}

/**
 * Auth Service - Business logic for authentication
 */
export default function createAuthService(fastify: FastifyInstance): AuthService {
  const prisma = fastify.prisma as PrismaClient
  const jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key-change-this'
  const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '1h'

  /**
   * Validate email format
   */
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   * Must be at least 8 characters, contain uppercase, lowercase, and number
   */
  function validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number')
    }
  }

  /**
   * Hash password using Argon2
   */
  async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MB
      timeCost: 2,
      parallelism: 1
    })
  }

  /**
   * Verify password against hash
   */
  async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password)
    } catch {
      return false
    }
  }

  /**
   * Generate JWT access token
   */
  function generateAccessToken(userId: number, email: string): string {
    return jwt.sign(
      {
        sub: userId,
        email: email
      },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn
      } as jwt.SignOptions
    )
  }

  /**
   * Register a new user
   */
  async function registerUser(email: string, password: string, fullname: string) {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Validate password
    validatePassword(password)

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullname
      }
    })

    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }
  }

  /**
   * Login user
   */
  async function loginUser(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generate access token
    const accessToken = generateAccessToken(user.id, user.email)

    // Create refresh token
    const rawRefreshToken = randomUUID() + '-' + randomUUID()
    const refreshTokenHash = await hashPassword(rawRefreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt
      }
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async function refreshToken(refreshToken: string) {
    // Find active refresh tokens
    const candidates = await prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    })

    // Find matching token
    let match: { id: number; userId: number } | null = null
    for (const token of candidates) {
      const isValid = await verifyPassword(refreshToken, token.tokenHash)
      if (isValid) {
        match = { id: token.id, userId: token.userId }
        break
      }
    }

    if (!match) {
      throw new Error('Invalid refresh token')
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: match.userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: match.id },
      data: { revokedAt: new Date() }
    })

    // Create new refresh token (rotation)
    const newRawRefreshToken = randomUUID() + '-' + randomUUID()
    const newRefreshTokenHash = await hashPassword(newRawRefreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt
      }
    })

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email)

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname
      }
    }
  }

  /**
   * Logout by revoking refresh token
   */
  async function logout(refreshToken: string): Promise<void> {
    const tokens = await prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 500
    })

    for (const token of tokens) {
      const isValid = await verifyPassword(refreshToken, token.tokenHash)
      if (isValid) {
        await prisma.refreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() }
        })
        return
      }
    }
    // No-op if not found
  }

  /**
   * Get user profile
   */
  async function getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      userId: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    }
  }

  return {
    registerUser,
    loginUser,
    refreshToken,
    logout,
    getUserProfile
  }
}

