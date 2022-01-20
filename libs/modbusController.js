var Q = require('q');

class MODBUSCONTROLLER {
    constructor(options) {

        this.testVal = 7
        this.arrRegisters = Array.from({ length: 10000 }, (v, i) => 0)

        this.init()
    }

    init() {
        this.arrRegisters[0] = 44
        this.arrRegisters[1] = 45
    }


    processData(data) {
        var deferred = Q.defer()
        let bufData = Buffer.from(data)

        console.log('data[7]', data[7])
        switch (data[7]) {
            case (3): //ReadHolding Registers
                deferred.resolve(this.processReadRequest(data))
                break
            case (6): //Write Single Holding Registers
            case (16): //Write Multiple Holding Registers
                deferred.resolve(this.processWriteRequest(data))
                break
            default:
                console.error(`unhandled function code in processReadRequest for ${data[7]}`)
                deferred.reject(`unhandled function code in processReadRequest for ${data[7]}`)
        }

        // deferred.resolve(Buffer.from('hello world'))
        return deferred.promise


    }

    processReadRequest(data) {
        var deferred = Q.defer()
        let bufData = Buffer.from(data)
        let self = this

        switch (data[7]) {
            case (3): //ReadHolding Registers
                // let readHoldingPayload = Buffer.alloc(11)
                let regCount = bufData.readUInt8(11)
                let readHoldingPayload = Buffer.alloc(9 + (regCount * 2))
                let transId = bufData.readUInt16BE(0)
                console.log('transId', transId)
                readHoldingPayload.writeInt16BE(transId, 0)            //transaction identifier
                readHoldingPayload.writeInt16BE(0, 2)           //protocol identifier
                readHoldingPayload.writeInt16BE((regCount * 2) + 3, 4)           //length

                readHoldingPayload.writeUInt8(1, 6)           //unit identifier/slave address

                readHoldingPayload.writeUInt8(3, 7)           //function code 3=Read Holding registers

                readHoldingPayload.writeUInt8((regCount * 2), 8)           //byte Count

                let regWriteStartPos = 9
                let regReadStartPos = bufData.readUInt16BE(8)
                let regReadIndex = 0
                let arrValue = 0
                for (let i = 0; i < regCount; i++) {
                    let v
                    try {
                        v = self.arrRegisters[regReadStartPos + regReadIndex]
                    } catch (e) {
                        v = 69
                    }
                    readHoldingPayload.writeInt16BE(v, regWriteStartPos)           //Register Value
                    regWriteStartPos += 2
                    regReadIndex++
                }

                deferred.resolve(readHoldingPayload)

                break
            default:
                console.error(`unhandled function code in processReadRequest for ${data[7]}`)
                deferred.reject(`unhandled function code in processReadRequest for ${data[7]}`)
        }

        // deferred.resolve(Buffer.from('hello world'))
        return deferred.promise
    }

    processWriteRequest(data) {
        var deferred = Q.defer()
        let bufData = Buffer.from(data)

        let transId = bufData.readUInt16BE(0)
        let startReg = bufData.readUInt16BE(8)

        let self = this


        switch (data[7]) {
            case (6): //Write Single Holding Registers
                try {
                    let writeHoldingRegister = Buffer.alloc(12)
                    writeHoldingRegister.writeInt16BE(transId, 0)            //transaction identifier
                    writeHoldingRegister.writeInt16BE(0, 2)           //protocol identifier
                    writeHoldingRegister.writeInt16BE(6, 4)           //length

                    writeHoldingRegister.writeUInt8(1, 6)           //unit identifier/slave address

                    writeHoldingRegister.writeUInt8(6, 7)           //function code 16=Write multiple Holding registers ---- 6=Write single

                    writeHoldingRegister.writeInt16BE(startReg, 8)           //starting register Address

                    let regValue6 = bufData.readUInt16BE(10)
                    self.arrRegisters[startReg] = regValue6
                    writeHoldingRegister.writeInt16BE(regValue6, 10)

                    deferred.resolve(writeHoldingRegister)

                } catch (e) {
                    console.log('Error writing Single Holding Register',e)
                    deferred.reject(e)
                }

                break

            case (16): //WriteHolding Registers
                let writeMultipleHoldingRegisters = Buffer.alloc(12)
                writeMultipleHoldingRegisters.writeInt16BE(transId, 0)            //transaction identifier
                writeMultipleHoldingRegisters.writeInt16BE(0, 2)           //protocol identifier
                writeMultipleHoldingRegisters.writeInt16BE(6, 4)           //length

                writeMultipleHoldingRegisters.writeUInt8(1, 6)           //unit identifier/slave address

                writeMultipleHoldingRegisters.writeUInt8(16, 7)           //function code 16=Write multiple Holding registers ---- 6=Write single

                writeMultipleHoldingRegisters.writeInt16BE(startReg, 8)           //starting register Address

                let regValue = bufData.readUInt16BE(13)
                this.arrRegisters[startReg] = regValue
                console.log('this.testVal>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.arrRegisters[startReg])
                // writeMultipleHoldingRegisters.writeInt16BE(this.arrRegisters[startReg], 10)           //Register Value
                let regCount = bufData.readUInt16BE(8)
                writeMultipleHoldingRegisters.writeInt16BE(regCount, 10)

                deferred.resolve(writeMultipleHoldingRegisters)

                break
            default:
                console.error(`unhandled function code in processReadRequest for ${data[7]}`)
                deferred.reject(`unhandled function code in processReadRequest for ${data[7]}`)
        }

        return deferred.promise
    }

}
module.exports = MODBUSCONTROLLER