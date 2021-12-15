var Q = require('q');

class MODBUSCONTROLLER {
    constructor(options) {

        this.init()
    }

    init() {

    }

    processReadRequest(data) {
        var deferred = Q.defer()
        console.log(`processReadRequest ${data}`)
        let bufData = Buffer.from(data)

        switch (data[7]) {
            case (3): //ReadHolding Registers
                // let responsePayload = Buffer.alloc(bufData.readUInt16BE(10))
                let readHoldingPayload = Buffer.alloc(11)
                readHoldingPayload.writeInt16BE(bufData.readUInt16BE(0),0)            //transaction identifier
                readHoldingPayload.writeInt16BE(0,2)           //protocol identifier
                readHoldingPayload.writeInt16BE(5,4)           //length
                
                readHoldingPayload.writeUInt8(247,6)           //unit identifier/slave address
        
                readHoldingPayload.writeUInt8(3,7)           //function code 3=Read Holding registers
                
                readHoldingPayload.writeUInt8(2,8)           //register Count

                readHoldingPayload.writeInt16BE(69,9)           //Register Value

                deferred.resolve(readHoldingPayload)
        
                break
            default:
                console.error(`unhandled function code in processReadRequest for ${data[7]}`)
                deferred.reject(`unhandled function code in processReadRequest for ${data[7]}`)
        }

        // deferred.resolve(Buffer.from('hello world'))
        return deferred.promise
    }
}
module.exports = MODBUSCONTROLLER