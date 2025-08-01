import { mediaDatabase } from '../database/index.js';
import { CreateMediaSchema, UpdateMediaSchema, MediaParamsSchema, MediaQuerySchema, } from '../schemas/media.js';
import { NotFoundError, ConflictError } from '../utils/index.js';
export async function mediaRoutes(fastify) {
    // Get all media with optional filtering
    fastify.get('/media', {
        schema: {
            tags: ['media'],
            summary: 'Get all media items',
            description: 'Retrieve all media items with optional filtering and pagination',
            querystring: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        description: 'Number of items to return (max 100)',
                    },
                    offset: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Number of items to skip',
                    },
                    source: {
                        type: 'string',
                        description: 'Filter by source name (case-insensitive)',
                    },
                },
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
                                    uniqueId: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    url: { type: 'string' },
                                    source: { type: 'string' },
                                    thumbnail: { type: 'string' },
                                },
                            },
                        },
                        total: { type: 'integer' },
                        filtered: { type: 'integer' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const query = MediaQuerySchema.parse(request.query);
        const media = mediaDatabase.getAllMedia();
        // Apply filtering
        let filteredMedia = media;
        if (query.source) {
            filteredMedia = media.filter((item) => item.source.toLowerCase().includes(query.source.toLowerCase()));
        }
        // Apply pagination
        if (query.limit || query.offset) {
            const offset = query.offset || 0;
            const limit = query.limit || 10;
            filteredMedia = filteredMedia.slice(offset, offset + limit);
        }
        return {
            data: filteredMedia,
            total: media.length,
            filtered: filteredMedia.length,
        };
    });
    // Get specific media by uniqueId
    fastify.get('/media/:id', {
        schema: {
            tags: ['media'],
            summary: 'Get media by ID',
            description: 'Retrieve a specific media item by its unique ID',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Media unique ID' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        uniqueId: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        url: { type: 'string' },
                        source: { type: 'string' },
                        thumbnail: { type: 'string' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const params = MediaParamsSchema.parse(request.params);
        const media = mediaDatabase.getMediaById(params.id);
        if (!media) {
            throw new NotFoundError('Media');
        }
        return media;
    });
    // Create new media
    fastify.post('/media', {
        schema: {
            tags: ['media'],
            summary: 'Create new media',
            description: 'Create a new media item',
            body: {
                type: 'object',
                properties: {
                    uniqueId: {
                        type: 'string',
                        pattern: '^[a-zA-Z0-9_-]+$',
                        maxLength: 100,
                    },
                    name: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 1000 },
                    url: { type: 'string', format: 'uri', maxLength: 500 },
                    source: { type: 'string', maxLength: 100 },
                    thumbnail: { type: 'string', format: 'uri', maxLength: 500 },
                },
                required: [
                    'uniqueId',
                    'name',
                    'description',
                    'url',
                    'source',
                    'thumbnail',
                ],
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                uniqueId: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                url: { type: 'string' },
                                source: { type: 'string' },
                                thumbnail: { type: 'string' },
                            },
                        },
                    },
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const mediaData = CreateMediaSchema.parse(request.body);
        // Check if media with this uniqueId already exists
        if (mediaDatabase.mediaExists(mediaData.uniqueId)) {
            throw new ConflictError('Media with this uniqueId already exists');
        }
        mediaDatabase.addMedia(mediaData);
        reply.status(201).send({
            message: 'Media created successfully',
            data: mediaData,
        });
    });
    // Update existing media
    fastify.put('/media/:id', {
        schema: {
            tags: ['media'],
            summary: 'Update media',
            description: 'Update an existing media item',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Media unique ID' },
                },
                required: ['id'],
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 1000 },
                    url: { type: 'string', format: 'uri', maxLength: 500 },
                    source: { type: 'string', maxLength: 100 },
                    thumbnail: { type: 'string', format: 'uri', maxLength: 500 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                uniqueId: { type: 'string' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                url: { type: 'string' },
                                source: { type: 'string' },
                                thumbnail: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const params = MediaParamsSchema.parse(request.params);
        const updates = UpdateMediaSchema.parse(request.body);
        // Check if media exists
        if (!mediaDatabase.mediaExists(params.id)) {
            throw new NotFoundError('Media');
        }
        const success = mediaDatabase.updateMedia(params.id, updates);
        if (!success) {
            throw new Error('No changes made to media');
        }
        const updatedMedia = mediaDatabase.getMediaById(params.id);
        return {
            message: 'Media updated successfully',
            data: updatedMedia,
        };
    });
    // Delete media
    fastify.delete('/media/:id', {
        schema: {
            tags: ['media'],
            summary: 'Delete media',
            description: 'Delete a media item by its unique ID',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Media unique ID' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const params = MediaParamsSchema.parse(request.params);
        // Check if media exists
        if (!mediaDatabase.mediaExists(params.id)) {
            throw new NotFoundError('Media');
        }
        const success = mediaDatabase.deleteMedia(params.id);
        if (!success) {
            throw new Error('Failed to delete media');
        }
        return {
            message: 'Media deleted successfully',
        };
    });
}
