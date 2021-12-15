var MODBUSSERVER = require('./libs/modbusServer')
var MODBUSCONTROLLER = require('./libs/modbusController')

let modbusController = new MODBUSCONTROLLER({})

let options= {
    port: 5002,
    modbusController: modbusController
}
let modbusServer = new MODBUSSERVER(options)