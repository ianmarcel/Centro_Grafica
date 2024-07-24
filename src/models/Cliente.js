const db = require('./db')

const Cliente = db.sequelize.define("cliente", {
  id: {
    type: db.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: db.Sequelize.STRING,
  },
  telefone1: {
    type: db.Sequelize.STRING
  },
  telefone2: {
    type: db.Sequelize.STRING
  },
  cep: {
    type: db.Sequelize.STRING
  },
  logradouro: {
    type: db.Sequelize.STRING
  },
  bairro: {
    type: db.Sequelize.STRING
  },
  numero: {
    type: db.Sequelize.INTEGER
  },
  cidade: {
    type: db.Sequelize.STRING
  },
  estado: {
    type: db.Sequelize.STRING
  },
  cpf: {
    type: db.Sequelize.STRING,
    unique: true
  }
})

//Cliente.sync({alter: true})
module.exports = Cliente