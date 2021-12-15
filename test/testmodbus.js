var Q = require('q');
var net = require('net')

var option = {
    host: 'localhost',
    port: 5002
}

var client = net.createConnection(option, () => {
    console.log(`client connected`)
})
client.on('data', (data) => {
    `test client received ${data}`
})




var assert = require('assert')

describe('do stuff', () => {
    it('stuff doing', async () => {


        let readHoldingPayload = Buffer.alloc(12)
        readHoldingPayload.writeInt16BE(0,0)            //transaction identifier
        readHoldingPayload.writeInt16BE(0,2)           //protocol identifier
        readHoldingPayload.writeInt16BE(6,4)           //length
        
        readHoldingPayload.writeUInt8(247,6)           //unit identifier/slave address

        readHoldingPayload.writeUInt8(3,7)           //function code 3=Read Holding registers
        
        readHoldingPayload.writeInt16BE(100,8)           //Register Number 2 bytes
        readHoldingPayload.writeInt16BE(1,10)           //register Count





        function send() {
            console.log(`sending`)
            var deferred = Q.defer()
            client.on('data', (data) => {
                console.log(`test client received ${data}`)
                deferred.resolve(data)
            })

            client.write(readHoldingPayload)

            return deferred.promise
        }

        await send()

    })
})