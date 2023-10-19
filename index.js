const io = require('socket.io')(3001, {
    cors: {
        origin: '*'
    }
})

// connected users or live users example: [{userId:'12234', socketId:'678899999'},{userId:'87778778', socketId:'76876977432'},]
let users = []

const addUserToLive = (userId, socketId) => {
    !users.some(eachUser => eachUser.userId === userId) &&
        users.push({ userId, socketId })
}

const removeUserFromLive = (socketId) => {
    users = users.filter(eachUser => eachUser.socketId !== socketId)
}

const getReceiverUserSocketId = (receiverId) => {
    return users.find(user => user.userId === receiverId)
}

io.on('connection', (socket) => {
    socket.on('addUserToLive', (userId) => {
        addUserToLive(userId, socket.id)
        io.emit('getAllLiveUsers', users)
    })

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        // find receiver socket id
        const receiverUser = getReceiverUserSocketId(receiverId)
        const receiverUserSocketId = receiverUser?.socketId
        socket.to(receiverUserSocketId).emit("receiveMessage", {
            senderId,
            text
        })
    })

    socket.on('disconnect', () => {
        removeUserFromLive(socket.id)
        io.emit('getAllLiveUsers', users)
    })
})
