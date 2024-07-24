const express = require('express')
const path = require('path')
const pg = require('pg')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Pedido = require('./models/Pedido')
const Estoque = require('./models/Estoque')
const Cliente = require('./models/Cliente')
const ItemPedido = require('./models/ItemPedido')
const app = express()
const bodyParser = require("body-parser")
const Gastos = require('./models/Gastos')
const {calcQtd} = require('./calculo-quantidade')

const port = process.env.PORT || 3000

pg.defaults.ssl = true
app.set('view engine', 'ejs')

app.use(express.static("public"))

app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/index', (req, res) => {
  res.render('index')
})

app.get("/novo-orcamento", (req, res) => {
  res.render('novoOrcamento')
})

app.get('/lista-orcamento', (req, res) => {
  res.render('listaOrcamento')
})

app.get('/registrar-estoque', (req, res) => {
  res.render('registrarEstoque')
})

app.get('/listagem-estoque', (req, res) => {
  res.render('listagemEstoque')
})

app.get('/listagem-gastos', (req, res) => {
  res.render('listagemGastos')
})

app.get('/lista-pedido', (req, res) => {
  res.render('listaPedidos')
})

app.get('/json/lista-orcamento', async (req, res) => {
  const resp = await Pedido.findAll({
    attributes: ['id', 'data_pedido'],
    where: {
      status_pedido: 'Em_orcamento'
    },
    include: [Cliente,
      ItemPedido]
  })
  return res.json(resp)
})

app.get('/json/orcamento/:id', async (req, res) => {
  const resp = await Pedido.findByPk(req.params.id, {
    include: [Cliente, ItemPedido]
  });
  return res.json(resp);
})

app.get('/json/cliente/:cpf', async (req, res) => {
  const resp = await Cliente.findOne({ where: { cpf: req.params.cpf } }).catch((err) => {
    console.log(err)
  })
  return res.json(resp);
})

app.get('/json/lista-pedido', async (req, res) => {
  const resp = await Pedido.findAll({
    attributes: ['id', 'data_pedido', 'status_pedido'],
    where: {
      status_pedido: {
        [Op.and]: [{ [Op.ne]: 'Em_orcamento' }, { [Op.ne]: 'Cancelado' }]
      }
    },
    order: ['status_pedido'],
    include: [Cliente, ItemPedido]
  })

  return res.json(resp)
})

app.get('/json/lista-estoque', async (req, res) => {
  const resp = await Estoque.findAll({
    attributes: ['id', 'quantidade', 'valor', 'descricao', 'tipo'],
    order: ['tipo', 'quantidade']
  })

  return res.json(resp)
})

app.get('/json/estoque/:id', async (req, res) => {
  const resp = await Estoque.findByPk(req.params.id)

  return res.json(resp)
})

app.get('/json/lista-gastos', async (req, res) => {
  const resp = await Gastos.findAll({
    include: Estoque,
    order: ['createdAt']
  })

  return res.json(resp)
})

app.get('/json/gastos-periodo/:inicio/:fim', async (req, res) => {
  const resp = await Gastos.findAll({
    where: {
      createdAt: {
        [Op.between]: [req.params.inicio, req.params.fim]
      }
    },
    include: Estoque,
    order: ['createdAt']
  })

  return res.json(resp)
})

app.post('/add-orcamento', async (req, res) => {
  const cpf = req.body.cpfCliente

  const [cliente, created] = await Cliente.findOrCreate({
    where: {
      cpf: cpf
    },
    defaults: {
      nome: req.body.nomeCliente,
      telefone1: req.body.telefoneCliente,
      telefone2: req.body.telefoneCliente2,
      cep: req.body.cepCliente,
      logradouro: req.body.logradouroCliente,
      bairro: req.body.bairroCliente,
      numero: req.body.numCliente,
      cidade: req.body.cidadeCliente,
      estado: req.body.estadoCliente,
      cpf: req.body.cpfCliente
    }
  }).catch((err) => {
    console.log(err)
  })

  if (created)
    await Cliente.update({
      nome: req.body.nomeCliente,
      telefone1: req.body.telefoneCliente,
      telefone2: req.body.telefoneCliente2,
      cep: req.body.cepCliente,
      logradouro: req.body.logradouroCliente,
      bairro: req.body.bairroCliente,
      numero: req.body.numCliente,
      cidade: req.body.cidadeCliente,
      estado: req.body.estadoCliente,
      cpf: req.body.cpfCliente
    }, {
      where: {
        cpf: cpf
      }
    })

  const pedido = await Pedido.create({
    idCliente: cliente.id,
    data_pedido: req.body.data,
    status_pedido: 'Em_orcamento'
  }).catch((err) => {
    console.log(err)
  })

  if (typeof req.body.produto === "object")
    for (i = 0; i < req.body.produto.length; i++) {
      await ItemPedido.create({
        quantidade: req.body.quantidade[i],
        colorido: req.body.colorido[i],
        formato_papel: req.body.formato[i],
        idEstoque: req.body.produto[i],
        idPedido: pedido.id,
          extra: req.body.extra[i],
          valorExtra: req.body.valorExtra[i]
      }).catch((err) => {
        console.log(err)
      })
    }
  else {
    await ItemPedido.create({
      quantidade: req.body.quantidade,
      colorido: req.body.colorido,
      formato_papel: req.body.formato,
      idEstoque: req.body.produto,
      idPedido: pedido.id,
          extra: req.body.extra,
          valorExtra: req.body.valorExtra
    }).catch((err) => {
      console.log(err)
    })
  }
  return res.redirect('/lista-orcamento')
})

app.post('/altera-estoque/:id', async (req, res) => {
  await Estoque.update({
    valor: req.body.preco
  }, {
    where: {
      id: req.params.id
    }
  }).then(() => {
    res.redirect('/listagem-estoque')
  })
})

app.post('/pedidos/:id/finalizar', async (req, res) => {
  const itemsPedido = await ItemPedido.findAll({ where: { idPedido: req.params.id } });
  for(let i=0; i<itemsPedido.length; i++){
    const itemPedido = itemsPedido[i];
    await Estoque.update({
      quantidade: Sequelize.literal('quantidade - '+ calcQtd(itemPedido.quantidade, itemPedido.formato_papel, itemPedido.colorido))
    }, {
      where: {
        id: itemPedido.idEstoque
      }
    })
  }
  res.status(200).send("ok");
})

app.post('/altera-estoque/:id/:op', async (req, res) => {
  const estoque = await Estoque.findByPk(req.params.id)
  const { quantidade } = req.body
  var qtd = estoque.quantidade

  if (req.params.op == 'add') {
    qtd += parseInt(quantidade, 10)
    await Gastos.create({
      quantidade: quantidade,
      valor: req.body.precoCompra,
      idEstoque: req.params.id
    })
  }
  else if (req.params.op == 'remove')
    qtd -= parseInt(quantidade, 10)

  if (qtd < 0)
    return res.redirect('/listagem-estoque')

  await Estoque.update({
    quantidade: qtd
  }, {
    where: {
      id: req.params.id
    }
  }).then(() => {
    res.redirect('/listagem-estoque')
  })


})

app.post('/add-estoque', async (req, res) => {
  await Estoque.create({
    quantidade: 0,
    descricao: req.body.desc,
    valor: req.body.valor,
    tipo: req.body.tipo
  }).then(() => {
    res.redirect('/listagem-estoque')
  }).catch((err) => {
    console.log(err)
  })
})

app.post('/update-orcamento/:id', async (req, res) => {
  if (typeof req.body.id === "object") {
    for (i = 0; i < req.body.id.length; i++) {
      await ItemPedido.findOrCreate({
        where: {
          id: req.body.id[i]
        },
        defaults: {
          quantidade: req.body.quantidade[i],
          colorido: req.body.colorido[i],
          formato_papel: req.body.formato[i],
          idEstoque: req.body.produto[i],
          idPedido: req.params.id,
          extra: req.body.extra[i],
          valorExtra: req.body.valorExtra[i]
        }
      })
      await ItemPedido.update({
        quantidade: req.body.quantidade[i],
        colorido: req.body.colorido[i],
        formato_papel: req.body.formato[i],
        idEstoque: req.body.produto[i],
        idPedido: req.params.id,
        extra: req.body.extra[i],
        valorExtra: req.body.valorExtra[i]
      }, {
        where: {
          id: req.body.id[i]
        }
      })

    }
  }
  else
    await ItemPedido.update({
      quantidade: req.body.quantidade,
      colorido: req.body.colorido,
      formato_papel: req.body.formato,
      idEstoque: req.body.produto,
      idPedido: req.params.id,
      extra: req.body.extra,
      valorExtra: req.body.valorExtra
    }, {
      where: {
        id: req.body.id
      }
    })
  return res.redirect('/lista-orcamento')
})

app.post('/altera-status/:id/:tipo', (req, res) => {
  Pedido.update({
    status_pedido: req.params.tipo
  },
    {
      where: {
        id: req.params.id
      }
    }
  ).then(() => {
    res.redirect('/lista-orcamento')
  }).catch((err) => {
    console.log(err)
  })
})

app.post('/add-gastos', (req, res) => {
  Gastos.create({
    data: req.body.data,
    descricao: req.body.descricao,
    valor: req.body.valor
  }).then(() => {
    res.redirect('gastos')
  }).catch((erro) => {
    console.log(erro)
  })
})

//teste

app.post('/teste', (req, res) => {
  const tipo = typeof req.body.id
  let obj = {
    tipo: tipo,
    tamanho: req.body.id.length
  }
  return res.json([obj, req.body])
})



app.listen(port, () => {
  console.log('Server running on port %d', port)
})
