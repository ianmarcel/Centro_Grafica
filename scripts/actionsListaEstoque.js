function createLista(){
    let dados = JSON.parse(this.responseText);
    let text = '';

    for (i = 0; i < dados.length; i++) {
        let prod = dados[i];
        text += `
        <tr>
            <td class="align-middle text-center" style="width:20%" scope="row">${prod.tipo}</td>
            <td class="align-middle">${prod.descricao}</td>
            <td class="align-middle text-center" style="width:10%">${prod.quantidade}</td>
            <td class="align-middle text-center" style="width:10%">${numeral(prod.valor.replace('.',',')).format('$ 0.00')}</td>
            <td class="align-middle text-center" style="width:10%">${numeral(prod.quantidade * prod.valor).format('$ 0.00')}</td>
            <td class="align-middle text-center" >
                <button onclick="setTargetAltera(${prod.id})" class="btn btn-dark" data-bs-toggle="modal"
                    data-bs-target="#alterar-preco">Alterar preço</button>
                <button onclick="setTarget(${prod.id},'add')" class="btn btn-dark" data-bs-toggle="modal"
                    data-bs-target="#alterar">Adicionar</button>
                <button onclick="setTarget(${prod.id},'remove')" class="btn btn-dark" data-bs-toggle="modal"
                    data-bs-target="#alterar">Remover</button>
            </td>
        </tr>
        `
    }

    $('tbody').html(text) 
}

function getJSON() {
    let req = new XMLHttpRequest();
    req.onload = createLista;
    req.open('GET', '/json/lista-estoque');
    req.send();
}

function setTarget(id, op){
    console.log('chamou')
    $('#form-alterar').attr('action', `/altera-estoque/${id}/${op}`)
    if (op == 'add')   {
        $('#divPrecoCompra').css('visibility', 'visible')
        $('.modal-title').first().html('Adicionar produto')
        $('button.enviar').first().html('Adicionar')
    }
    else {
        $('#divPrecoCompra').css('visibility', 'hidden')
        $('.modal-title').first().html('Remover produto')
        $('button.enviar').first().html('Remover')
    }
}

function setTargetAltera(id){
    $('#form-alterar-preco').attr('action', `/altera-estoque/${id}`)
}
