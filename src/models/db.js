const Sequelize = require('sequelize')
const configDb = require('./configDb')


const sequelize = new Sequelize(configDb)

module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize,
}