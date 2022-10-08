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
            let socketData = Buffer.alloc(0)

            socket.on('data', (chunck)=>{
                if(socketData.length == 1){
                    socketData = chunck
                }else{
                    socketData = Buffer.concat([socketData,chunck])
                }
                setTimeout(async ()=>{
                    let thisData = Buffer.from(socketData)
                    socketData = Buffer.alloc(0)
                    console.log('thisData.length',thisData.length)
                    console.log('socketData.length',socketData.length)
                    try{
                        let response = await self.modbusController.processData(thisData)
                        socket.write(response)
                        console.log(response)
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