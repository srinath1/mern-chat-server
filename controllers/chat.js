const users=[]
const addUser=(userName)=>{
    const name=userName.trim().toLowerCase()
    const existingUser=users.find(user=>user===name)
    if(!userName.trim()) return {error :'Name is required'}
    if(existingUser){
        return{
            error:'Name already in use'
        }
    }else{
        users.push(name)
        return userName
    }
}

const chat=(io)=>{
    console.log(`Live chat----`,io.opts)
io.use((socket,next)=>{
    const userName=socket.handshake.auth.userName
    console.log('username on handshake',userName)
    if(!userName){
        return next(new Error('Inavlid username'))
    }
    socket.userName=userName
    next()
})


    io.on('connection',(socket,next)=>{
        // console.log('socket id=>',socket.id)
        // socket.on('username',(userName)=>{

        //     let result=addUser(userName)
        //     if(result.error){
        //         return next(result.error)
        //     }else{
        //         io.emit('users',users)
        //         socket.broadcast.emit('user joined',`${userName} joined`)

        //     }
        //     // console.log(userName)
        //     // io.emit('user joined',`${userName} joined`)
        // })

        let users=[]

        for(let [id,socket] of io.of('/').sockets ){
            const existingUser=users.find(u=>u.userName===socket.userName)
            if(existingUser){
                socket.emit('userName taken')
                socket.disconnect()
                return 
            }else{
                users.push({
                    userId:id,
                    userName:socket.userName
                })
            }

        }

        socket.emit('users',users)
        socket.broadcast.emit('user connected',{
            userId:socket.id,
            userName:socket.userName
        })
        socket.on('message',data=>{
            io.emit('message',data)
        })
        socket.on('typing',(userName)=>{
            socket.broadcast.emit('typing',`${userName} is typing....`)

        })
        socket.on('private message',({message,to})=>{

            console.log('message,to',message,to)
            console.log('socket_id=>',socket.id)
            socket.to(to).emit('private message',{
                message,
                from:socket.id
            })
        })
        socket.on('disconnect',()=>{
            console.log('socket disconnected')
            socket.broadcast.emit('user disconnected',socket.id)
        })
    })
    
}

export default chat