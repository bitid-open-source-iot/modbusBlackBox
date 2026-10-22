'use strict'

var assert = require('assert')
var net = require('net')
var MODBUSCONTROLLER = require('../libs/modbusController')
var MODBUSSERVER = require('../libs/modbusServer')

function writeSingle(reg, val, tid) {
    var buf = Buffer.alloc(12)
    buf.writeUInt16BE(tid, 0)
    buf.writeUInt16BE(0, 2)
    buf.writeUInt16BE(6, 4)
    buf.writeUInt8(1, 6)
    buf.writeUInt8(6, 7)
    buf.writeUInt16BE(reg, 8)
    buf.writeUInt16BE(val, 10)
    return buf
}

function readHolding(reg, tid) {
    var buf = Buffer.alloc(12)
    buf.writeUInt16BE(tid, 0)
    buf.writeUInt16BE(0, 2)
    buf.writeUInt16BE(6, 4)
    buf.writeUInt8(1, 6)
    buf.writeUInt8(3, 7)
    buf.writeUInt16BE(reg, 8)
    buf.writeUInt16BE(1, 10)
    return buf
}

function txn(port, payload) {
    return new Promise(function (resolve, reject) {
        var sock = net.connect({ host: '127.0.0.1', port: port }, function () {
            sock.write(payload)
        })
        var chunks = []
        var timer = setTimeout(function () {
            sock.destroy()
            reject(new Error('modbus timeout'))
        }, 3000)
        sock.on('data', function (c) { chunks.push(c) })
        sock.on('error', function (err) {
            clearTimeout(timer)
            reject(err)
        })
        sock.once('data', function () {
            setTimeout(function () {
                clearTimeout(timer)
                sock.end()
                resolve(Buffer.concat(chunks))
            }, 150)
        })
    })
}

function freePort() {
    return new Promise(function (resolve, reject) {
        var s = net.createServer()
        s.listen(0, '127.0.0.1', function () {
            var p = s.address().port
            s.close(function () { resolve(p) })
        })
        s.on('error', reject)
    })
}

describe('modbus holding round-trip', function () {
    var server
    var port

    before(async function () {
        port = await freePort()
        var controller = new MODBUSCONTROLLER({})
        var ms = new MODBUSSERVER({ port: port, modbusController: controller })
        server = ms.server
        if (!server.listening) {
            await new Promise(function (resolve, reject) {
                server.once('listening', resolve)
                server.once('error', reject)
            })
        }
    })

    after(function (done) {
        if (!server) return done()
        server.close(done)
    })

    it('writes a holding register and reads the same value back', async function () {
        var reg = 200
        var val = 4242
        var writeResp = await txn(port, writeSingle(reg, val, 1))
        assert.ok(writeResp.length >= 12, 'write response too short: ' + writeResp.toString('hex'))
        assert.strictEqual(writeResp[7], 6)
        assert.strictEqual(writeResp.readUInt16BE(10), val)

        var readResp = await txn(port, readHolding(reg, 2))
        assert.ok(readResp.length >= 11, 'read response too short: ' + readResp.toString('hex'))
        assert.strictEqual(readResp[7], 3)
        assert.strictEqual(readResp.readUInt16BE(9), val)
    })
})
