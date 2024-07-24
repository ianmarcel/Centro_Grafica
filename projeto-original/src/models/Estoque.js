const db = require('./db')

const Estoque = db.sequelize.define("estoque", {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantidade: {
    type: db.Sequelize.INTEGER,
  },
  descricao: {
    type: db.Sequelize.STRING
  },
  valor: {
    type: db.Sequelize.DECIMAL(5,2)
  },
  tipo:{
    type: db.Sequelize.ENUM('Papel','Suprimento')
  }
})

//Estoque.sync({alter: true})
module.exports = Estoque