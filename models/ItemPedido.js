const db = require('./db')
const Estoque = require('./Estoque')
const Pedido = require('./Pedido')

const ItemPedido = db.sequelize.define("ItemPedido", {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantidade: {
    type: db.Sequelize.INTEGER,
  },
  formato_papel: db.Sequelize.INTEGER,
  colorido: db.Sequelize.BOOLEAN,
  extra: db.Sequelize.STRING,
  valorExtra: db.Sequelize.DECIMAL(5,2)
})

ItemPedido.belongsTo(Estoque,{
  constraint: true,
  foreignKey: 'idEstoque'
})

Estoque.hasMany(ItemPedido,{
  constraint: true,
  foreignKey: 'idEstoque'
})

ItemPedido.belongsTo(Pedido,{
  constraint: true,
  foreignKey: 'idPedido'
})

Pedido.hasMany(ItemPedido,{
  constraint: true,
  foreignKey: 'idPedido'
})


//ItemPedido.sync({alter: true})
module.exports = ItemPedido