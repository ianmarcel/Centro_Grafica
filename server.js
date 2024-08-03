const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
// const serviceAccount = require('firebaseConfig');
const serviceAccount = require('./config/config_key.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://central-grafica-a134f.firebaseio.com"  // Certifique-se de usar o URL correto do seu banco de dados
});

const db = admin.firestore();

const app = express();
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.set('views', path.join(__dirname, 'pages'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/index', (req, res) => {
  res.render('index.html');
});

app.get("/novo-orcamento", (req, res) => {
  res.render('novoOrcamento.html');
});

app.get('/lista-orcamento', (req, res) => {
  res.render('listaOrcamento.html');
});

app.get('/registrar-estoque', (req, res) => {
  res.render('registrarEstoque.html');
});

app.get('/listagem-estoque', (req, res) => {
  res.render('listagemEstoque.html');
});

app.get('/listagem-gastos', (req, res) => {
  res.render('listagemGastos.html');
});

app.get('/lista-pedido', (req, res) => {
  res.render('listaPedidos.html');
});

app.get('/json/lista-orcamento', async (req, res) => {
  const snapshot = await db.collection('Pedido').where('status_pedido', '==', 'Em_orcamento').get();
  const orcamentos = snapshot.docs.map(doc => doc.data());
  return res.json(orcamentos);
});

app.get('/json/orcamento/:id', async (req, res) => {
  const pedidoRef = db.collection('Pedido').doc(req.params.id);
  const pedidoDoc = await pedidoRef.get();
  return res.json(pedidoDoc.data());
});

app.get('/json/cliente/:cpf', async (req, res) => {
  const clienteRef = db.collection('Cliente').doc(req.params.cpf);
  const clienteDoc = await clienteRef.get();
  return res.json(clienteDoc.data());
});

app.get('/json/lista-pedido', async (req, res) => {
  const snapshot = await db.collection('Pedido').where('status_pedido', 'in', ['Aberto', 'Finalizado']).get();
  const pedidos = snapshot.docs.map(doc => doc.data());
  return res.json(pedidos);
});

app.get('/json/lista-estoque', async (req, res) => {
  const snapshot = await db.collection('Estoque').orderBy('tipo').orderBy('quantidade').get();
  const estoque = snapshot.docs.map(doc => doc.data());
  return res.json(estoque);
});

app.get('/json/estoque/:id', async (req, res) => {
  const estoqueRef = db.collection('Estoque').doc(req.params.id);
  const estoqueDoc = await estoqueRef.get();
  return res.json(estoqueDoc.data());
});

app.get('/json/lista-gastos', async (req, res) => {
  const snapshot = await db.collection('Gastos').orderBy('createdAt').get();
  const gastos = snapshot.docs.map(doc => doc.data());
  return res.json(gastos);
});

app.get('/json/gastos-periodo/:inicio/:fim', async (req, res) => {
  const snapshot = await db.collection('Gastos')
    .where('createdAt', '>=', new Date(req.params.inicio))
    .where('createdAt', '<=', new Date(req.params.fim))
    .orderBy('createdAt')
    .get();
  const gastos = snapshot.docs.map(doc => doc.data());
  return res.json(gastos);
});

app.post('/add-orcamento', async (req, res) => {
  const clienteRef = db.collection('Cliente').doc(req.body.cpfCliente);
  const clienteDoc = await clienteRef.get();

  if (!clienteDoc.exists) {
    await clienteRef.set({
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
    });
  }

  const pedidoRef = db.collection('Pedido').doc();
  await pedidoRef.set({
    idCliente: req.body.cpfCliente,
    data_pedido: req.body.data,
    status_pedido: 'Em_orcamento'
  });

  if (Array.isArray(req.body.produto)) {
    for (let i = 0; i < req.body.produto.length; i++) {
      await db.collection('ItemPedido').add({
        quantidade: req.body.quantidade[i],
        colorido: req.body.colorido[i],
        formato_papel: req.body.formato[i],
        idEstoque: req.body.produto[i],
        idPedido: pedidoRef.id,
        extra: req.body.extra[i],
        valorExtra: req.body.valorExtra[i]
      });
    }
  } else {
    await db.collection('ItemPedido').add({
      quantidade: req.body.quantidade,
      colorido: req.body.colorido,
      formato_papel: req.body.formato,
      idEstoque: req.body.produto,
      idPedido: pedidoRef.id,
      extra: req.body.extra,
      valorExtra: req.body.valorExtra
    });
  }
  return res.redirect('/lista-orcamento');
});

app.post('/altera-estoque/:id', async (req, res) => {
  const estoqueRef = db.collection('Estoque').doc(req.params.id);
  await estoqueRef.update({
    valor: req.body.preco
  });
  return res.redirect('/listagem-estoque');
});

app.post('/pedidos/:id/finalizar', async (req, res) => {
  const itemsPedidoSnapshot = await db.collection('ItemPedido').where('idPedido', '==', req.params.id).get();
  const batch = db.batch();
  itemsPedidoSnapshot.docs.forEach((doc) => {
    const itemPedido = doc.data();
    const estoqueRef = db.collection('Estoque').doc(itemPedido.idEstoque);
    batch.update(estoqueRef, {
      quantidade: admin.firestore.FieldValue.increment(-itemPedido.quantidade)
    });
  });
  await batch.commit();
  return res.status(200).send("ok");
});

app.post('/altera-estoque/:id/:op', async (req, res) => {
  const estoqueRef = db.collection('Estoque').doc(req.params.id);
  const estoqueDoc = await estoqueRef.get();
  let qtd = estoqueDoc.data().quantidade;

  if (req.params.op === 'add') {
    qtd += parseInt(req.body.quantidade, 10);
    await db.collection('Gastos').add({
      quantidade: req.body.quantidade,
      valor: req.body.precoCompra,
      idEstoque: req.params.id
    });
  } else if (req.params.op === 'remove') {
    qtd -= parseInt(req.body.quantidade, 10);
  }

  if (qtd < 0) return res.redirect('/listagemEstoques');

  await estoqueRef.update({
    quantidade: qtd
  });
  return res.redirect('/listagemEstoques');
});

app.post('/add-estoque', async (req, res) => {
  await db.collection('Estoque').add({
    quantidade: 0,
    descricao: req.body.desc,
    valor: req.body.valor,
    tipo: req.body.tipo
  });
  return res.redirect('/listagemEstoques');
});

app.post('/update-orcamento/:id', async (req, res) => {
  const pedidoRef = db.collection('Pedido').doc(req.params.id);

  if (Array.isArray(req.body.id)) {
    for (let i = 0; i < req.body.id.length; i++) {
      const itemPedidoRef = db.collection('ItemPedido').doc(req.body.id[i]);
      const itemPedidoDoc = await itemPedidoRef.get();
      if (itemPedidoDoc.exists) {
        await itemPedidoRef.update({
          quantidade: req.body.quantidade[i],
          colorido: req.body.colorido[i],
          formato_papel: req.body.formato[i],
          idEstoque: req.body.produto[i],
          extra: req.body.extra[i],
          valorExtra: req.body.valorExtra[i]
        });
      } else {
        await db.collection('ItemPedido').add({
          quantidade: req.body.quantidade[i],
          colorido: req.body.colorido[i],
          formato_papel: req.body.formato[i],
          idEstoque: req.body.produto[i],
          idPedido: req.params.id,
          extra: req.body.extra[i],
          valorExtra: req.body.valorExtra[i]
        });
      }
    }
  } else {
    const itemPedidoRef = db.collection('ItemPedido').doc(req.body.id);
    await itemPedidoRef.update({
      quantidade: req.body.quantidade,
      colorido: req.body.colorido,
      formato_papel: req.body.formato,
      idEstoque: req.body.produto,
      extra: req.body.extra,
      valorExtra: req.body.valorExtra
    });
  }
  return res.redirect('/lista-orcamento');
});

app.post('/altera-status/:id/:tipo', async (req, res) => {
  const pedidoRef = db.collection('Pedido').doc(req.params.id);
  await pedidoRef.update({
    status_pedido: req.params.tipo
  });
  return res.redirect('/lista-orcamento');
});

app.post('/add-gastos', async (req, res) => {
  await db.collection('Gastos').add({
    data: req.body.data,
    descricao: req.body.descricao,
    valor: req.body.valor
  });
  return res.redirect('gastos');
});

app.listen(port, () => {
  console.log('Server running on port %d', port);
});
