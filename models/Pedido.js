const Cliente = require('./Cliente')
const db = require('./db')

const Pedido = db.sequelize.define('pedido', {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data_pedido: {
    type: db.Sequelize.DATE
  },
  status_pedido: {
    type: db.Sequelize.ENUM('Em_orcamento', 'Aberto', 'Cancelado', 'Finalizado')
  }
})

Pedido.belongsTo(Cliente,{
  constraint: true,
  foreignKey: 'idCliente'
})
Cliente.hasMany(Pedido,{
  constraint: true,
  foreignKey: 'idCliente'
})

//Pedido.sync({alter: true})
module.exports = Pedido