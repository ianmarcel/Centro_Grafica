
function atualizarData() {
    if (document.getElementById('data').valueAsDate == null) {
        document.getElementById('data').valueAsDate = new Date();
    }
}

function inserirLinha() {
    $('#tableProdutos>tbody').append(`
<tr>
    <input type="hidden" name="id" class="idItem">
    <th class="table-input-quant" scope="row">
        <input type="number" min="1" value="1" name="quantidade"
            class="form-control form-table input-qtd" required>
    </th>
    <th class="table-input-desc">
        <select name="produto" class="form-select select-produto" required>
        </select>
    </th>
    <th class="table-input-formato">
        <select class="form-select select-formato" name="formato" required>
            <option selected disabled>Selecione o formato</option>
            <option disabled>66 x 96</option>
            <option value="1">Formato 33x48</option>
            <option value="2">Formato 32x33</option>
            <option value="3">Formato 24x42</option>
            <option value="4">Formato 22x48</option>
            <option value="5">Formato 22x37</option>
            <option value="6">Formato 24x33</option>
            <option value="7">Formato 22x32</option>
            <option value="8">Formato 19,2x33</option>
            <option value="9">Formato 16x33</option>
            <option value="10">Formato 22x24</option>
            <option value="11">Formato 19,2x23,4</option>
            <option value="12">Formato 19,2x22</option>
            <option value="13">Formato 16,5x24</option>
            <option value="14">Formato 16x22</option>
            <option value="15">Formato 12,3x22</option>
            <option value="16">Formato 16x16,5</option>
            <option value="17">Formato 13,2x19,2</option>
            <option value="18">Formato 15,75x16,5</option>
            <option value="19">Formato 12x16,5</option>
            <option disabled>64 x 88</option>
            <option value="20">Formato 32x44</option>
            <option value="21">Formato 29,33x32</option>
            <option value="22">Formato 22x24</option>
            <option value="23">Formato 21,3x44</option>
            <option value="24">Formato 21,3x33</option>
            <option value="25">Formato 22x32</option>
            <option value="26">Formato 21,3x29,3</option>
            <option value="27">Formato 17,6x32</option>
            <option value="28">Formato 21,3x22,25</option>
            <option value="29">Formato 21,3x22</option>
            <option value="30">Formato 17,6x23,2</option>
            <option value="31">Formato 17,6x21,3</option>
            <option value="32">Formato 16x22</option>
            <option value="33">Formato 14,6x21,3</option>
            <option value="34">Formato 14x16</option>
            <option value="35">Formato 11,1x21,3</option>
            <option value="36">Formato 14,6x16</option>
            <option value="37">Formato 12,6x17,6</option>
            <option value="38">Formato 11x16</option>
        </select>
    </th>
    <th class="table-input-color">
        <div class="form-check form-switch">
            <input onchange="setValue(this);" value="true"
                class="form-check-input input-color" type="checkbox" name="colorido">
            <input type="hidden" name="colorido" value="false">
        </div>
    </th>
    <th class="table-input-desc" scope="row">
        <input type="text" name="extra" 
            class="form-control form-table input-extra">
    </th>
    <th class="table-input-valorExtra" scope="row">
        <input type="number" min="0" step="0.01" name="valorExtra" 
            class="form-control form-table input-valorExtra">
    </th>
</tr>
    `)
    getJSONEstoque();
}

$(document).ready(function () {
    function limpa_formulário_cep() {
        // Limpa valores do formulário de cep.
        $("#logradouroCliente").val("");
        $("#bairroCliente").val("");
        $("#cidadeCliente").val("");
        $("#estadoCliente").val("");
    }

    //Quando o campo cep perde o foco.
    $("#cepCliente").blur(function () {

        //Nova variável "cep" somente com dígitos.
        var cep = $(this).val().replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if (validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#logradouroCliente").val("...");
                $("#bairroCliente").val("...");
                $("#cidadeCliente").val("...");
                $("#estadoCliente").val("...");

                //Consulta o webservice viacep.com.br/
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        $("#logradouroCliente").val(dados.logradouro);
                        $("#bairroCliente").val(dados.bairro);
                        $("#cidadeCliente").val(dados.localidade);
                        $("#estadoCliente").val(dados.uf);
                    } //end if.
                    else {
                        //CEP pesquisado não foi encontrado.
                        limpa_formulário_cep();
                        alert("CEP não encontrado.");
                    }
                });
            } //end if.
            else {
                //cep é inválido.
                limpa_formulário_cep();
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
            limpa_formulário_cep();
        }
    });

});

function autoComplete() {
    let dados = JSON.parse(this.responseText);
    if (dados != null) {
        $('#nomeCliente').val(dados.nome)
        $('#telefoneCliente').val(dados.telefone1)
        $('#telefoneCliente2').val(dados.telefone2)
        $('#cepCliente').val(dados.cep)
        $('#logradouroCliente').val(dados.logradouro)
        $('#bairroCliente').val(dados.bairro)
        $('#numCliente').val(dados.numero)
        $('#cidadeCliente').val(dados.cidade)
        $('#estadoCliente').val(dados.estado)
    }
}


function getCliente() {
    let cpf = $('#cpfCliente').val();
    let req = new XMLHttpRequest();
    req.onload = autoComplete;
    req.open('GET', `/json/cliente/${cpf}`);
    req.send();
}

function createSelect() {
    let dados = JSON.parse(this.responseText);
    for (i = 0; i < dados.length; i++) {
        let prod = dados[i];
        if (prod.tipo == "Papel" && prod.quantidade > 0) {
            $('.select-produto').last().append(`
            <option value="${prod.id}">${prod.descricao}</option>
            `)
        }
    }
    
}

function getJSONEstoque() {
    let req = new XMLHttpRequest();
    req.onload = createSelect;
    req.open('GET', '/json/lista-estoque');
    req.send();
}

function setValue(i) {
    if ($(i).is(':checked')) {
        $(i).next().prop('disabled',true)
    } else {
        $(i).next().prop('disabled',false)
    }
}