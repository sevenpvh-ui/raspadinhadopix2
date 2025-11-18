const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Prêmios disponíveis
const premios = [
    { valor: "R$ 10,00", prob: 0.3 },
    { valor: "R$ 25,00", prob: 0.2 },
    { valor: "R$ 50,00", prob: 0.1 },
    { valor: "R$ 100,00", prob: 0.05 },
    { valor: "R$ 500,00", prob: 0.01 },
    { valor: "Tente Novamente", prob: 0.34 }
];

// Rota principal
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Raspadinha do PIX',
        premios: premios
    });
});

// Socket para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);
    
    socket.on('raspar', () => {
        // Simula o resultado da raspadinha
        const random = Math.random();
        let acumulado = 0;
        let premioSelecionado = "Tente Novamente";
        
        for (const premio of premios) {
            acumulado += premio.prob;
            if (random <= acumulado) {
                premioSelecionado = premio.valor;
                break;
            }
        }
        
        socket.emit('resultado', { premio: premioSelecionado });
    });
    
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎯 Raspadinha do PIX rodando na porta ${PORT}`);
});
