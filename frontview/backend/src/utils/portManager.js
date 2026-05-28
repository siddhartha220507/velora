// utils/portManager.js

const MIN_PORT = 3100;
const MAX_PORT = 4000;

// Ek 'Set' banayenge jo track karega ki kaun se ports currently use ho rahe hain
const usedPorts = new Set();

const getAvailablePort = () => {
    // 3100 se 4000 tak loop chalao aur pehla khali port dhundho
    for (let port = MIN_PORT; port <= MAX_PORT; port++) {
        if (!usedPorts.has(port)) {
            usedPorts.add(port); // Port ko 'used' mark kar do
            return port;
        }
    }
    // Agar 900+ projects ek sath chal rahe hain to ho sakta hai ki ports khatam ho jayein
    throw new Error('No available ports left in the pool!');
};

const releasePort = (port) => {
    // Jab app stop ho jaye, toh is port ko free kar do
    if (port) {
        usedPorts.delete(Number(port));
        console.log(`Port ${port} has been released back to the pool.`);
    }
};

module.exports = { getAvailablePort, releasePort };