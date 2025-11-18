class RaspadinhaGame {
    constructor() {
        this.socket = io();
        this.isScratching = false;
        this.hasScratched = false;
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }
    
    init() {
        this.createScratchCanvas();
        this.setupEventListeners();
        this.setupSocketListeners();
    }
    
    createScratchCanvas() {
        const overlay = document.getElementById('scratchOverlay');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        const card = document.querySelector('.scratch-card');
        this.canvas.width = card.offsetWidth;
        this.canvas.height = card.offsetHeight;
        
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '3';
        this.canvas.style.cursor = 'crosshair';
        
        overlay.appendChild(this.canvas);
        this.drawScratchSurface();
    }
    
    drawScratchSurface() {
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#888';
        for(let i = 0; i < 50; i++) {
            this.ctx.beginPath();
            this.ctx.arc(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 3 + 1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RASPE AQUI!', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    setupEventListeners() {
        // Eventos do canvas de raspadinha
        this.canvas.addEventListener('mousedown', this.startScratching.bind(this));
        this.canvas.addEventListener('mousemove', this.scratch.bind(this));
        this.canvas.addEventListener('mouseup', this.stopScratching.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopScratching.bind(this));
        
        // Eventos touch para mobile
        this.canvas.addEventListener('touchstart', this.startScratching.bind(this));
        this.canvas.addEventListener('touchmove', this.scratch.bind(this));
        this.canvas.addEventListener('touchend', this.stopScratching.bind(this));
        
        // Botões
        document.getElementById('scratchBtn').addEventListener('click', () => {
            this.simulateScratching();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('closePopup').addEventListener('click', () => {
            this.hideResultPopup();
        });
    }
    
    setupSocketListeners() {
        this.socket.on('resultado', (data) => {
            this.showResult(data.premio);
        });
    }
    
    startScratching(e) {
        if (this.hasScratched) return;
        
        this.isScratching = true;
        this.scratch(e);
    }
    
    stopScratching() {
        this.isScratching = false;
        
        if (this.hasScratched) return;
        
        // Verifica se pelo menos 30% foi raspado
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const transparentPixels = this.countTransparentPixels(imageData);
        const totalPixels = this.canvas.width * this.canvas.height;
        const percentage = (transparentPixels / totalPixels) * 100;
        
        if (percentage > 30) {
            this.hasScratched = true;
            this.socket.emit('raspar');
        }
    }
    
    scratch(e) {
        if (!this.isScratching || this.hasScratched) return;
        
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    countTransparentPixels(imageData) {
        let count = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) {
                count++;
            }
        }
        return count;
    }
    
    simulateScratching() {
        if (this.hasScratched) return;
        
        // Simula o efeito de raspagem
        const interval = setInterval(() => {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
        }, 10);
        
        setTimeout(() => {
            clearInterval(interval);
            this.hasScratched = true;
            this.socket.emit('raspar');
        }, 1000);
    }
    
    showResult(premio) {
        const popup = document.getElementById('resultPopup');
        const prizeAmount = document.getElementById('prizeAmount');
        const popupTitle = document.getElementById('popupTitle');
        const popupMessage = document.getElementById('popupMessage');
        
        prizeAmount.textContent = premio;
        
        if (premio.includes('R$')) {
            popupTitle.textContent = 'PARABÉNS! 🎉';
            popupTitle.style.color = '#FFD700';
        } else {
            popupTitle.textContent = 'QUE PENA! 😢';
            popupTitle.style.color = '#FF6B00';
        }
        
        popup.style.display = 'flex';
        
        // Efeitos sonoros (simulados)
        this.playSound(premio.includes('R$') ? 'win' : 'scratch');
    }
    
    hideResultPopup() {
        document.getElementById('resultPopup').style.display = 'none';
    }
    
    resetGame() {
        this.hasScratched = false;
        this.drawScratchSurface();
    }
    
    playSound(type) {
        // Em uma implementação real, você teria arquivos de áudio
        console.log(`Playing ${type} sound`);
    }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new RaspadinhaGame();
});
