const express = require('express');
const path = require('path');


const { v4: uuidv4 } = require('uuid');


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {debug: true})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peerjs', peerServer)



app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});


app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});


io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});








