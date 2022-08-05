const ModbusRTU = require('modbus-serial')
const client = new ModbusRTU()

client.connectTCP('127.0.0.1', { port: 502 })
client.setID(2)

function binConverter(rawValues) {
    // ? PEGA O PRIMEIRO REG 16 BITS E INCREMENTA ZEROS À ESQUERDA
    let varBinLo = rawValues.data[0].toString(2)
    let missLo = 16 - varBinLo.length
    let varArrayLo = varBinLo.split('')
    for (i = 0; i < missLo; i++) {
        varArrayLo.unshift('0')
    }
    // ? PEGA O SEGUNDO REG 16 BITS E INCREMENTA ZEROS À ESQUERDA
    let varBinHi = rawValues.data[1].toString(2)
    let missHi = 16 - varBinHi.length
    let varArrayHi = varBinHi.split('')
    for (i = 0; i < missHi; i++) {
        varArrayHi.unshift('0')
    }
    // ? RETORNA A CONCATENAÇÃO FORMANDO UM REGISTRADOR ABCD DE 32 BITS
    console.log(varArrayLo.concat(varArrayHi))
    return varArrayLo.concat(varArrayHi)
}

function floatConverter(rawValue) {
    // ? ESTUTRURA DO FLOAT 32: BIT 32 = SIGN, BITS 31 AO 23 = EXPOENTS E RESTANTE MANTISSA
    // ? BIT^SIGN * 2^EXPOENT(DECIMAL)-127 * (1 + ([BIT 22] * 2^-1) + ([BIT 21] * 2^-2) ... ([BIT 22] * 2^-22))
    let binValue = binConverter(rawValue)
    let s = binValue[0]
    let expBin = [
        binValue[1],
        binValue[2],
        binValue[3],
        binValue[4],
        binValue[5],
        binValue[6],
        binValue[7],
        binValue[8],
    ]

    // ? PASSANDO OS 8 BITS DO EXPOENTE DE BINÁRIO PARA DECIMAL
    dec = 0
    for (let c = 0; c < expBin.length; c++) {
        dec += Math.pow(2, c) * expBin[expBin.length - c - 1]
    }

    let exp = dec - 127

    let mantissaArray = [
        binValue[9],
        binValue[10],
        binValue[11],
        binValue[12],
        binValue[13],
        binValue[14],
        binValue[15],
        binValue[16],
        binValue[17],
        binValue[18],
        binValue[19],
        binValue[20],
        binValue[21],
        binValue[22],
        binValue[23],
        binValue[24],
        binValue[25],
        binValue[26],
        binValue[27],
        binValue[28],
        binValue[29],
        binValue[30],
        binValue[31],
    ]
    let mantissa = 0;
    for(pos=0; pos<23; pos++){
      let bit = mantissaArray[pos]
      let element = bit*2**(-pos-1)
      mantissa += element
    }

    let float = (-1)**s * 2**exp * (1 + mantissa)
    console.log('s=' + s + ' exp=' + exp + ' mantissa='+ mantissa + " FLOAT=" + float)
}

setInterval(async function () {
    let rawValues = await client.readHoldingRegisters(0, 2)
    floatConverter(rawValues)
    //console.log()
}, 1000)