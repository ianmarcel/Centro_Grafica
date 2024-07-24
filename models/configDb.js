let obj = {}

if (process.env.DIALECT == 'postgres') {
    obj = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}

module.exports = {
    dialect: process.env.DIALECT || 'mysql',
    host: process.env.HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    username: process.env.USER || 'marcioone',
    password: process.env.PASSWORD || '68664411',
    database: process.env.DATABASE || 'grafica',
    define: {
        timestamps: true,
        underscored: false
    },
    dialectOptions: obj
}