# Backend Foundation Notes

- The backend uses an Express application with versioned routing under `/api/v1`.
- Controllers are thin request handlers and delegate to services.
- Services contain business logic and are reserved for future modules.
- Repositories are prepared for future PostgreSQL access layers.
- Middleware includes rate limiting, validation, async handling, and global error handling.
- Database and Redis are configured as deferred integrations that activate once credentials are provided.
