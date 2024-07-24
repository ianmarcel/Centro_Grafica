
function defFormato(formato) {
    if (formato == 1 || formato == 20)
        return 4
    if ((formato >= 2 && formato <= 4) || (formato >= 21 && formato <= 23))
        return 6
    if (formato == 5 || formato == 24)
        return 7
    if (formato == 6 || formato == 25)
        return 8
    if (formato == 7 || formato == 26)
        return 9
    if (formato == 8 || formato == 27)
        return 10
    if (formato == 28)
        return 11
    if (formato == 9 || formato == 10 || formato == 29)
        return 12
    if (formato == 11 || formato == 30)
        return 14
    if (formato == 12 || formato == 31)
        return 15
    if (formato == 13 || formato == 32)
        return 16
    if (formato == 14 || formato == 33)
        return 18
    if (formato == 15 || formato == 35)
        return 23
    if (formato == 16 || formato == 36)
        return 24
    if (formato == 17 || formato == 37)
        return 25
    if (formato == 18 || formato == 34)
        return 26
    if (formato == 19 || formato == 38)
        return 32
}

function calcQtd(qtd, formato, cor) {
    if (cor)
        return Math.ceil(qtd / defFormato(formato)) + 50
    else
        return Math.ceil(qtd / defFormato(formato)) + 10
}

module.exports = {calcQtd}