const Sequelize = require('sequelize');

class DatabaseManager {
    static instance = null;
    static connectionAttempts = 0;
    static maxRetries = 3;

    static getInstance() {
        if (!DatabaseManager.instance) {
            const DATABASE_URL = process.env.DATABASE_URL || './database.db';
            const isSQLite = DATABASE_URL === './database.db' || DATABASE_URL.startsWith('sqlite:');
            
            const config = isSQLite 
                ? {
                      dialect: 'sqlite',
                      storage: DATABASE_URL,
                      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
                      retry: {
                          max: 3,
                          timeout: 30000,
                          match: [
                              /SQLITE_BUSY/,
                              /SQLITE_LOCKED/,
                              /SQLITE_READONLY/,
                              /SQLITE_IOERR/,
                              /SQLITE_CORRUPT/,
                              /SQLITE_CANTOPEN/
                          ],
                      },
                      pool: {
                          max: 5,
                          min: 0,
                          acquire: 30000,
                          idle: 10000
                      }
                  }
                : {
                      dialect: 'postgres',
                      ssl: true,
                      protocol: 'postgres',
                      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
                      dialectOptions: {
                          ssl: { 
                              require: true, 
                              rejectUnauthorized: false 
                          },
                          native: true,
                          connectionTimeoutMillis: 10000,
                          idle_in_transaction_session_timeout: 10000
                      },
                      retry: {
                          max: 5,
                          timeout: 60000,
                          match: [
                              /ConnectionError/,
                              /ConnectionRefusedError/,
                              /ConnectionTimedOutError/,
                              /SequelizeConnectionError/,
                              /SequelizeConnectionRefusedError/,
                              /SequelizeConnectionTimedOutError/,
                              /timeout/,
                              /ECONNREFUSED/,
                              /ECONNRESET/,
                              /ETIMEDOUT/
                          ],
                      },
                      pool: {
                          max: 10,
                          min: 0,
                          acquire: 60000,
                          idle: 10000,
                          evict: 10000,
                          handleDisconnects: true
                      },
                      // PostgreSQL specific settings
                      native: false, // Use pg-native if available
                  };

            DatabaseManager.instance = isSQLite 
                ? new Sequelize(config)
                : new Sequelize(DATABASE_URL, config);

            // Add event listeners for connection
            DatabaseManager.instance
                .authenticate()
                .then(() => {
                    console.log(`✅ Database connection established successfully (${isSQLite ? 'SQLite' : 'PostgreSQL'})`);
                    DatabaseManager.connectionAttempts = 0;
                })
                .catch(error => {
                    console.error('❌ Unable to connect to the database:', error.message);
                    DatabaseManager.connectionAttempts++;
                    
                    if (DatabaseManager.connectionAttempts < DatabaseManager.maxRetries) {
                        console.log(`Retrying connection (${DatabaseManager.connectionAttempts}/${DatabaseManager.maxRetries})...`);
                        setTimeout(() => DatabaseManager.getInstance(), 5000);
                    }
                });
        }
        return DatabaseManager.instance;
    }

    static async syncDatabase(options = {}) {
        try {
            const db = this.getInstance();
            const syncOptions = {
                force: false,
                alter: false,
                logging: process.env.DB_SYNC_LOGGING === 'true',
                ...options
            };

            console.log(`🔄 Starting database synchronization (force: ${syncOptions.force}, alter: ${syncOptions.alter})...`);
            
            await db.sync(syncOptions);
            console.log('✅ Database synchronized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error synchronizing the database:', error);
            throw error;
        }
    }

    static async closeConnection() {
        if (DatabaseManager.instance) {
            await DatabaseManager.instance.close();
            console.log('🔒 Database connection closed');
            DatabaseManager.instance = null;
        }
    }

    static async healthCheck() {
        try {
            const db = this.getInstance();
            await db.authenticate();
            return { status: 'healthy', timestamp: new Date() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message, timestamp: new Date() };
        }
    }

    // Utility method for transactions
    static async transaction(callback, options = {}) {
        const db = this.getInstance();
        return await db.transaction(callback, options);
    }

    // Utility method for raw queries
    static async rawQuery(query, options = {}) {
        const db = this.getInstance();
        return await db.query(query, {
            type: Sequelize.QueryTypes.SELECT,
            ...options
        });
    }
}

// Initialize database connection
const DATABASE = DatabaseManager.getInstance();

// Handle process events for graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔻 Received SIGINT. Closing database connection...');
    await DatabaseManager.closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔻 Received SIGTERM. Closing database connection...');
    await DatabaseManager.closeConnection();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    if (error.name?.includes('Sequelize')) {
        console.error('Unhandled Sequelize rejection:', error);
    }
});

process.on('uncaughtException', (error) => {
    if (error.name?.includes('Sequelize')) {
        console.error('Uncaught Sequelize exception:', error);
        process.exit(1);
    }
});

// Auto-sync with environment variable control
if (process.env.DB_AUTO_SYNC !== 'false') {
    const syncOptions = {
        force: process.env.DB_FORCE_SYNC === 'true',
        alter: process.env.DB_ALTER_SYNC === 'true'
    };

    DatabaseManager.syncDatabase(syncOptions).catch(console.error);
}

module.exports = { 
    DATABASE, 
    DatabaseManager,
    Sequelize 
};
