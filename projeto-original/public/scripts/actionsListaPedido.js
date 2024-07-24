function createListaPedidos() {
    let dados = JSON.parse(this.responseText);
    let text = '';

    for (i = 0; i < dados.length; i++) {
        let pedido = dados[i];
        if(pedido.status_pedido == "Aberto"){
        text += `
        <tr>
                        <td class="align-middle text-center" scope="row">${pedido.id}</td>
                        <td class="align-middle">${pedido.cliente.nome}</td>
                        <td class="align-middle text-center" style="width:5%">${(pedido.status_pedido)}</td>
                        <td class="align-middle text-center" style="width:10%">${new Date(pedido.data_pedido).toLocaleDateString('pt-BR', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                        <td class="align-middle text-center" style="width:30%">
                            <button onclick="getJSONView(${pedido.id});" type="button" class="btn btn-dark" data-bs-toggle="modal"
                                data-bs-target="#viewPedido">Detalhes</button>
                            <button onclick="fin(${pedido.id},this);" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#confirmaFinalizar">Finalizar</button>
                            <button onclick="del(${pedido.id});" type="button" class="btn btn-dark" data-bs-toggle="modal"
                                data-bs-target="#confirmaCancelar">Cancelar</button>
                        </td>
                    </tr>
        `}else{
            text += `
        <tr>
                        <td class="align-middle text-center" scope="row">${pedido.id}</td>
                        <td class="align-middle">${pedido.cliente.nome}</td>
                        <td class="align-middle text-center" style="width:5%">${pedido.status_pedido}</td>
                        <td class="align-middle text-center" style="width:10%">${new Date(pedido.data_pedido).toLocaleDateString('pt-BR', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                        <td class="align-middle text-center" style="width:30%">
                            <button onclick="getJSONView(${pedido.id});" type="button" class="btn btn-dark" data-bs-toggle="modal"
                                data-bs-target="#viewPedido">Detalhes</button>
                        </td>
                    </tr>
        `
        }
    }
    $('.table-pedido').html(text)
}

function getPedidos() {
    let req = new XMLHttpRequest();
    req.onload = createListaPedidos;
    req.open('GET', '/json/lista-pedido');
    req.send();
}

function finalizaPedido(id) {
    let req = new XMLHttpRequest();
    req.onload = () => location.reload();
    req.open('POST', `/altera-status/${id}/finalizado`);
    req.send();
}

function removeEstoque(id){
    let req = new XMLHttpRequest();
    req.onload = () => finalizaPedido(id);
    req.open('POST', `/pedidos/${id}/finalizar`);
    req.send();
}

function fin(id) {
    $('#confirmarFin').attr('onclick', `removeEstoque(${id});`)
}
