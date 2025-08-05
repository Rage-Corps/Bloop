import { FastifyInstance } from 'fastify'
import { db } from '../db/connection'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const allUsers = await db.select().from(users)
    return allUsers
  })

  fastify.get('/users/:id', {
    schema: {
      description: 'Get user by ID',
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: number }
    const user = await db.select().from(users).where(eq(users.id, id))
    
    if (user.length === 0) {
      reply.code(404)
      return { error: 'User not found' }
    }
    
    return user[0]
  })

  fastify.post('/users', {
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string }
    
    const newUser = await db.insert(users).values({
      name,
      email
    }).returning()
    
    reply.code(201)
    return newUser[0]
  })
}