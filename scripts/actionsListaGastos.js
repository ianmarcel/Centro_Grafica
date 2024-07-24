function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getJson() {
    let xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    if (typeof getUrlVars()['inicio'] !== 'undefined' && typeof getUrlVars()['fim'] !== 'undefined') {
        let inicio = getUrlVars()['inicio'] !== ''? getUrlVars()['inicio'] + 'T00:00:00.000Z' : '1900-01-01'
        let fim = getUrlVars()['fim'] !== ''? getUrlVars()['fim'] + 'T23:59:00.000Z' : '9999-01-01'
        $('#inicio').val(getUrlVars()['inicio'])
        $('#fim').val(getUrlVars()['fim'])
        xhr.open('GET', `/json/gastos-periodo/${inicio}/${fim}`);
        xhr.send();
    }
    else {
        xhr.open('GET', '/json/lista-gastos');
        xhr.send();
    }
    xhr.onload = () => {
        createLista(xhr.response);
    }
}

function createLista(dados) {
    let text = ''
    for (i = 0; i < dados.length; i++) {
        let gasto = dados[i]

        text += `
<tr>
    <td class="align-middle text-center" style="width:15%" scope="row">${new Date(gasto.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
    <td class="align-middle">${gasto.estoque.descricao}</td>
    <td class="align-middle text-center" style="width:10%">${gasto.quantidade}</td>
    <td class="align-middle text-center" style="width:10%">${numeral(gasto.valor.replace('.', ',')).format('$ 0.00')}</td>
    <td class="align-middle text-center" style="width:10%">${numeral(gasto.quantidade * gasto.valor).format('$ 0.00')}</td>

</tr>
    `
    }
    $('.tabela-gastos').html(text)
}
