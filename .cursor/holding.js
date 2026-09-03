#!/usr/bin/env node
// Tiny Modbus-TCP helper for the local blackbox (port 5002).
//   node .cursor/holding.js write 101 4242
//   node .cursor/holding.js read 101
'use strict';

const net = require('net');

const [, , mode, registerArg, valueArg] = process.argv;
// Edge-router's Modbus helper treats config "register" as 1-based and
// subtracts 1 before putting it on the wire. Match that so `write 101`
// lines up with `"register": 101` in .cursor/config.local.json.
const register1Based = parseInt(registerArg, 10);
const register = register1Based === 0 ? 65535 : register1Based - 1;
const value = parseInt(valueArg || '0', 10);
const host = process.env.MODBUS_HOST || '127.0.0.1';
const port = parseInt(process.env.MODBUS_PORT || '5002', 10);

if (!['read', 'write'].includes(mode) || Number.isNaN(register1Based)) {
    console.error('Usage: node holding.js read <register> | write <register> <value>');
    process.exit(2);
}

function txn(payload) {
    return new Promise((resolve, reject) => {
        const sock = net.connect({ host, port }, () => sock.write(payload));
        const chunks = [];
        const timer = setTimeout(() => {
            sock.destroy();
            reject(new Error('modbus timeout'));
        }, 3000);
        sock.on('data', (c) => chunks.push(c));
        sock.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
        sock.on('end', () => {
            clearTimeout(timer);
            resolve(Buffer.concat(chunks));
        });
        // blackbox replies after 100ms; close shortly after first data
        sock.once('data', () => setTimeout(() => sock.end(), 150));
    });
}

function writeSingle(reg, val) {
    const buf = Buffer.alloc(12);
    buf.writeUInt16BE(1, 0);   // tid
    buf.writeUInt16BE(0, 2);   // proto
    buf.writeUInt16BE(6, 4);   // length
    buf.writeUInt8(1, 6);      // unit
    buf.writeUInt8(6, 7);      // FC 6
    buf.writeUInt16BE(reg, 8);
    buf.writeUInt16BE(val, 10);
    return buf;
}

function readHolding(reg) {
    const buf = Buffer.alloc(12);
    buf.writeUInt16BE(1, 0);
    buf.writeUInt16BE(0, 2);
    buf.writeUInt16BE(6, 4);
    buf.writeUInt8(1, 6);
    buf.writeUInt8(3, 7);      // FC 3
    buf.writeUInt16BE(reg, 8);
    buf.writeUInt16BE(1, 10);
    return buf;
}

(async () => {
    if (mode === 'write') {
        const resp = await txn(writeSingle(register, value));
        if (resp.length < 12 || resp[7] !== 6) {
            throw new Error('unexpected write response: ' + resp.toString('hex'));
        }
        console.log(JSON.stringify({ op: 'write', register: register1Based, pduAddress: register, value, ok: true }));
        return;
    }
    const resp = await txn(readHolding(register));
    if (resp.length < 11 || resp[7] !== 3) {
        throw new Error('unexpected read response: ' + resp.toString('hex'));
    }
    const readValue = resp.readUInt16BE(9);
    console.log(JSON.stringify({ op: 'read', register: register1Based, pduAddress: register, value: readValue }));
})().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
