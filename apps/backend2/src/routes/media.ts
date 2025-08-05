import { FastifyInstance } from 'fastify'
import { db } from '../db/connection'
import { media, sources, categories } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default async function mediaRoutes(fastify: FastifyInstance) {
  fastify.get('/media', {
    schema: {
      description: 'Get all media items',
      tags: ['media'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              thumbnailUrl: { type: 'string' },
              pageUrl: { type: 'string' },
              createdAt: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const allMedia = await db.select().from(media)
    return allMedia
  })

  fastify.get('/media/:id', {
    schema: {
      description: 'Get media item by ID with sources and categories',
      tags: ['media'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            pageUrl: { type: 'string' },
            createdAt: { type: 'string' },
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  sourceName: { type: 'string' },
                  url: { type: 'string' }
                }
              }
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  category: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const mediaItem = await db.select().from(media).where(eq(media.id, id))
    if (mediaItem.length === 0) {
      reply.code(404)
      return { error: 'Media not found' }
    }

    const mediaSources = await db.select().from(sources).where(eq(sources.mediaId, id))
    const mediaCategories = await db.select().from(categories).where(eq(categories.mediaId, id))
    
    return {
      ...mediaItem[0],
      sources: mediaSources,
      categories: mediaCategories
    }
  })

  fastify.post('/media', {
    schema: {
      description: 'Create a new media item',
      tags: ['media'],
      body: {
        type: 'object',
        required: ['name', 'description', 'thumbnailUrl', 'pageUrl'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          thumbnailUrl: { type: 'string' },
          pageUrl: { type: 'string' },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sourceName: { type: 'string' },
                url: { type: 'string' }
              }
            }
          },
          categories: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            pageUrl: { type: 'string' },
            createdAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { name, description, thumbnailUrl, pageUrl, sources: reqSources = [], categories: reqCategories = [] } = request.body as {
      name: string
      description: string
      thumbnailUrl: string
      pageUrl: string
      sources?: { sourceName: string; url: string }[]
      categories?: string[]
    }
    
    const mediaId = randomUUID()
    
    const newMedia = await db.insert(media).values({
      id: mediaId,
      name,
      description,
      thumbnailUrl,
      pageUrl
    }).returning()

    if (reqSources.length > 0) {
      await db.insert(sources).values(
        reqSources.map(source => ({
          id: randomUUID(),
          mediaId,
          sourceName: source.sourceName,
          url: source.url
        }))
      )
    }

    if (reqCategories.length > 0) {
      await db.insert(categories).values(
        reqCategories.map(category => ({
          id: randomUUID(),
          mediaId,
          category
        }))
      )
    }
    
    reply.code(201)
    return newMedia[0]
  })
}