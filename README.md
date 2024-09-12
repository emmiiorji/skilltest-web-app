## Development Environment
1. Clone the repository:
   ```
   git clone https://github.com/your-username/skilltest-new.git
   cd skilltest-new
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add necessary environment variables (e.g., DATABASE_URL, PORT)

4. Set up the database:
   - Ensure MySQL is installed and running
   - Create a new database for the project

## Running the Application
### Development Mode
npm run dev

### Production Mode
npm run build
npm start

## Database Migrations
### Create a new migration
npm run migration:create -- -n MigrationName

### Generate a migration from entity changes
npm run migration:generate -- -n MigrationName

### Run pending migrations
npm run migration:run

### Revert the last migration
npm run migration:revert

### Show migration status
npm run migration:show

### Drops/Deletes the old database & migrations files. Then creates new migration files & Runs them.
npm run db:reset

## Project Structure
- `src/`: Source code directory
  - `controllers/`: Request handlers
  - `database/`: Database connection and configuration
  - `services/`: Business logic
  - `views/`: Handlebars templates
  - `server.ts`: Server entry point

## Technologies Used
- TypeScript
- Node.js
- Fastify
- Handlebars
- TypeORM
- Zod
- MySQL
