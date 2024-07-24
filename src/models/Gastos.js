const db = require('./db')
const Estoque = require('./Estoque')

const Gastos = db.sequelize.define("gastos", {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantidade: {
    type: db.Sequelize.INTEGER
  },
  valor: {
    type: db.Sequelize.DECIMAL(5,2)
  }
})

Gastos.belongsTo(Estoque,{
  constraint: true,
  foreignKey: 'idEstoque'
})

Estoque.hasMany(Gastos,{
  constraint: true,
  foreignKey: 'idEstoque'
})


//Gastos.sync({alter: true})
module.exports = Gastos