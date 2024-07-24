function createLista() {
    let dados = JSON.parse(this.responseText);
    let text = ' ';

    for (i = 0; i < dados.length; i++) {
        let orcamento = dados[i];
        text += `
        <tr id="orcamento-${orcamento.id}">
            <td class="align-middle text-center" scope="row">${orcamento.id}</td>
            <td class="align-middle">${orcamento.cliente.nome}</td>
            <td class="align-middle text-center" style="width:10%">${new Date(orcamento.data_pedido).toLocaleDateString('pt-BR', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
            <td class="align-middle text-center" style="width:30%">
                <button onclick="getJSONView(${orcamento.id});" type="button" class="btn btn-dark" data-bs-toggle="modal"
                    data-bs-target="#viewOrcamento">Detalhes</button>
                <button onclick="gerarPedido(${orcamento.id});" class="btn btn-dark">Gerar pedido</button>
                <button onclick="del(${orcamento.id});" type="button" class="btn btn-dark" data-bs-toggle="modal"
                    data-bs-target="#confirmaCancelar">Cancelar</button>
            </td>
        </tr>
        `
    }
    $('.table-orcamento').html(text)
}

function getJSON() {
    let req = new XMLHttpRequest();
    req.onload = createLista;
    req.open('GET', '/json/lista-orcamento');
    req.send();
}

function deletePedido(id) {
    let req = new XMLHttpRequest();
    req.onload = location.reload();
    req.open('POST', `/altera-status/${id}/cancelado`);
    req.send();
}

function del(id) {
    $('#confirmar').attr('onclick', `deletePedido(${id});`)
}

function gerarPedido(id) {
    let req = new XMLHttpRequest();
    req.onload = location.reload();
    req.open('POST', `/altera-status/${id}/aberto`);
    req.send();
}

function createView() {
    let dados = JSON.parse(this.responseText);
    $('#valorFinal').html(0)
    $('#cpfCliente').val(dados.cliente.cpf)
    $('#nomeCliente').val(dados.cliente.nome)
    $('#telefoneCliente').val(dados.cliente.telefone1)
    $('#telefoneCliente2').val(dados.cliente.telefone2)
    $('#cepCliente').val(dados.cliente.cep)
    $('#logradouroCliente').val(dados.cliente.logradouro)
    $('#bairroCliente').val(dados.cliente.bairro)
    $('#numCliente').val(dados.cliente.numero)
    $('#cidadeCliente').val(dados.cliente.cidade)
    $('#estadoCliente').val(dados.cliente.estado)
    $('#status').val(dados.status_pedido)
    if(dados.status_pedido === 'Finalizado') $('button:submit').first().prop('disabled',true)
    else $('button:submit').first().prop('disabled',false)
    $('#data').val($.format.date(new Date(dados.data_pedido), 'yyyy-MM-dd'))
    let i = 0
    setInterval(() => {
        if (i >= dados.ItemPedidos.length){
            return;
        }
        let item = dados.ItemPedidos[i]
        if (i > 0)
            inserirLinha()

        setTimeout(() => {
            $('.idItem').last().val(item.id)
            $('.input-qtd').last().val(item.quantidade)
            $('.select-formato').last().val(item.formato_papel)
            $('.input-color').last().prop('checked', item.colorido)
            $('.input-extra').last().val(item.extra)
            $('.input-valorExtra').last().val(item.valorExtra)
            setValue($('.input-color').last())
            getProduto(item)
            $('.select-produto').last().val(item.idEstoque)
        }, 75)
        i++
    }, 150)


}

function getJSONView(i) {
    $('form').attr('action', `update-orcamento/${i}`)
    let xhr = new XMLHttpRequest();
    xhr.onload = createView;
    xhr.open('GET', `/json/orcamento/${i}`);
    xhr.send();
}


function preencheValor(item, dados) {
    let atual = numeral($('#valorFinal').html())
    let valorOrcamento = calcularOrcamento(item.quantidade,
        dados.valor, item.formato_papel, item.colorido, 10, 17,item.valorExtra)
    $('#valorFinal').html(numeral(atual.value() + valorOrcamento).format('$ 0.00'))
}

function getProduto(item) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json'
    xhr.open('GET', `/json/estoque/${item.idEstoque}`);
    xhr.send();
    xhr.onload = ()=>{
        preencheValor(item,  xhr.response);
    } 
    
}

function apagarLinhas() {
    $("#tableProdutos").find("tr:gt(1)").remove()
}

