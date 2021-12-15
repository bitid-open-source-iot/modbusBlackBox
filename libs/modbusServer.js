var net = require('net')

class MODBUSSERVER{
    constructor(options){
        this.port = options.port || 5002
        this.modbusController = options.modbusController
        this.init()
    }

    init(){
        let self = this
        self.server = new net.Server()
        self.server.listen(self.port, ()=>{
            console.log(`Server listening on ${self.port}`)
        })

        self.server.on('connection', (socket)=>{
            console.log(`new client connection made ${JSON.stringify(socket)}`)
            let socketData = Buffer.alloc(0)

            socket.on('data', (chunck)=>{
                console.log(`data from client ${chunck.toString()}`)
                if(socketData.length == 1){
                    socketData = chunck
                }else{
                    socketData = Buffer.concat([socketData,chunck])
                }
                setTimeout(async ()=>{
                    console.log(`complete socketData ${socketData}`)
                    let response = await self.modbusController.processReadRequest(socketData)
                    try{
                        socket.write(response)
                    }catch(e){
                        console.error(e)
                    }
                },100)
    
            })
    
            socket.on('end', (socket)=>{
                console.log(`connection closed with client ${socket}`)
            })
    
            socket.on('error', (err)=>{
                console.log(`client error ${err}`)
            })
    


        })

        // self.server.on('data', (chunck)=>{
        //     console.log(`data from client ${chunck.toString()}`)
        //     let response = self.modbusController.processReadRequest(chunck)

        // })


        self.server.on('error', (err)=>{
            console.log(`server error ${err}`)
        })

    }
}
module.exports = MODBUSSERVER