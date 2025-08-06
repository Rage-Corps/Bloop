import { FastifyInstance } from 'fastify'
import { MediaHelper } from '../helpers/mediaHelper'
import { CategoryHelper } from '../helpers/categoryHelper'
import { SourceHelper } from '../helpers/sourceHelper'
import type { MediaQuery } from '@bloop/shared-types'

const mediaHelper = new MediaHelper()
const categoryHelper = new CategoryHelper()
const sourceHelper = new SourceHelper()

export default async function mediaRoutes(fastify: FastifyInstance) {
  fastify.get('/media', {
    schema: {
      description: 'Get paginated media items with sources and categories',
      tags: ['media'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
          source: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
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
                    items: { type: 'string' }
                  }
                }
              }
            },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const query = request.query as MediaQuery
    const result = await mediaHelper.getMediaWithPagination(query)
    return result
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
    
    const mediaItem = await mediaHelper.getMediaById(id)
    if (!mediaItem) {
      reply.code(404)
      return { error: 'Media not found' }
    }
    
    return mediaItem
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
    const { name, description, thumbnailUrl, pageUrl, sources = [], categories = [] } = request.body as {
      name: string
      description: string
      thumbnailUrl: string
      pageUrl: string
      sources?: { sourceName: string; url: string }[]
      categories?: string[]
    }
    
    const newMedia = await mediaHelper.createMedia({
      name,
      description,
      thumbnailUrl,
      pageUrl,
      sources,
      categories
    })
    
    reply.code(201)
    return newMedia
  })

  fastify.put('/media/:id', {
    schema: {
      description: 'Update a media item',
      tags: ['media'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          thumbnailUrl: { type: 'string' },
          pageUrl: { type: 'string' }
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
            createdAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updateData = request.body as {
      name?: string
      description?: string
      thumbnailUrl?: string
      pageUrl?: string
    }
    
    const updatedMedia = await mediaHelper.updateMedia(id, updateData)
    if (!updatedMedia) {
      reply.code(404)
      return { error: 'Media not found' }
    }
    
    return updatedMedia
  })

  fastify.delete('/media/:id', {
    schema: {
      description: 'Delete a media item',
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
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const deleted = await mediaHelper.deleteMedia(id)
    if (!deleted) {
      reply.code(404)
      return { error: 'Media not found' }
    }
    
    return { message: 'Media deleted successfully' }
  })

  fastify.post('/media/:id/sources', {
    schema: {
      description: 'Add a source to a media item',
      tags: ['media'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['sourceName', 'url'],
        properties: {
          sourceName: { type: 'string' },
          url: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { sourceName, url } = request.body as { sourceName: string; url: string }
    
    const newSource = await mediaHelper.addSourceToMedia(id, sourceName, url)
    if (!newSource) {
      reply.code(404)
      return { error: 'Media not found' }
    }
    
    reply.code(201)
    return newSource
  })

  fastify.post('/media/:id/categories', {
    schema: {
      description: 'Add a category to a media item',
      tags: ['media'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['category'],
        properties: {
          category: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { category } = request.body as { category: string }
    
    const newCategory = await mediaHelper.addCategoryToMedia(id, category)
    if (!newCategory) {
      reply.code(404)
      return { error: 'Media not found' }
    }
    
    reply.code(201)
    return newCategory
  })
}