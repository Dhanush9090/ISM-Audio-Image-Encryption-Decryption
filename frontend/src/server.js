const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const xss = require('xss');
const app = express();

// Add JSON parsing middleware
app.use(express.json());

const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

app.use(
    session({
        secret: crypto.randomBytes(32).toString('hex'),
        resave: false,
        saveUninitialized: false,
    })
);

app.post('/login', async (req, res) => {
    const username = req.body.username;

    try {
        req.session.username = xss(username);
        res.status(200).send({ message: 'Login successful' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/rag', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const username = req.session.username;
    if (!username) {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Set up directories
const dataDir = path.join(__dirname, '..', '..', 'data');
const archiveDir = path.join(__dirname, '..', '..', 'archive');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
}

const upload = multer({
    dest: dataDir,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.post('/encryptImage', upload.single('file'), async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const user = req.session.username;

    const timestamp = Date.now();
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `original_${user}_${timestamp}${fileExtension}`;
    const newFilePath = path.join(dataDir, newFileName);
    fs.renameSync(uploadedFilePath, newFilePath);

    const encryptedFileName = `encrypted_${user}_${timestamp}${fileExtension}`;

    try {
        const response = await axios.post('http://127.0.0.1:5000/encrypt-image', {
            image_name: newFileName,
            original_directory: dataDir,
            output_filename: encryptedFileName
        });

        console.log('Response from Flask server:', response.data);

        if (response.status === 200) {
            // Move the original file to the archive directory
            const archiveFilePath = path.join(archiveDir, newFileName);
            fs.renameSync(newFilePath, archiveFilePath);
            console.log('Original file moved to archive:', archiveFilePath);

            res.status(200).send(response.data);
        } else {
            res.status(500).send('Failed to encrypt image on the Flask server.');
        }
    } catch (error) {
        console.error('Error encrypting image on Flask server:', error.message);
        res.status(500).send('Error encrypting image on the Flask server.');
    }
});

app.post('/decryptImage', upload.single('file'), async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const user = req.session.username;

    const timestamp = Date.now();
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `encrypted_${user}_${timestamp}${fileExtension}`;
    const newFilePath = path.join(dataDir, newFileName);
    fs.renameSync(uploadedFilePath, newFilePath);

    const decryptedFileName = `decrypted_${user}_${timestamp}${fileExtension}`;

    try {
        const response = await axios.post('http://127.0.0.1:5000/decrypt-image', {
            image_name: newFileName,
            original_directory: dataDir,
            output_filename: decryptedFileName
        });

        console.log('Response from Flask server:', response.data);

        if (response.status === 200) {
            // Move the encrypted file to the archive directory
            const archiveFilePath = path.join(archiveDir, newFileName);
            fs.renameSync(newFilePath, archiveFilePath);
            console.log('Encrypted file moved to archive:', archiveFilePath);

            res.status(200).send(response.data);
        } else {
            res.status(500).send('Failed to decrypt image on the Flask server.');
        }
    } catch (error) {
        console.error('Error decrypting image on Flask server:', error.message);
        res.status(500).send('Error decrypting image on the Flask server.');
    }
});

app.post('/encryptAudio', upload.single('file'), async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const user = req.session.username;

    const timestamp = Date.now();
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `original_audio_${user}_${timestamp}${fileExtension}`;
    const newFilePath = path.join(dataDir, newFileName);
    fs.renameSync(uploadedFilePath, newFilePath);

    const encryptedFileName = `encrypted_audio_${user}_${timestamp}${fileExtension}`;

    try {
        const response = await axios.post('http://127.0.0.1:6000/encrypt-audio', {
            audio_name: newFileName,
            original_directory: dataDir,
            output_filename: encryptedFileName
        });

        console.log('Response from Flask server:', response.data);

        if (response.status === 200) {
            // Move the original file to the archive directory
            const archiveFilePath = path.join(archiveDir, newFileName);
            fs.renameSync(newFilePath, archiveFilePath);
            console.log('Original audio file moved to archive:', archiveFilePath);

            res.status(200).send(response.data);
        } else {
            res.status(500).send('Failed to encrypt audio on the Flask server.');
        }
    } catch (error) {
        console.error('Error encrypting audio on Flask server:', error.message);
        res.status(500).send('Error encrypting audio on the Flask server.');
    }
});

app.post('/decryptAudio', upload.single('file'), async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const user = req.session.username;

    const timestamp = Date.now();
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileExtension = path.extname(originalFileName);
    const newFileName = `encrypted_audio_${user}_${timestamp}${fileExtension}`;
    const newFilePath = path.join(dataDir, newFileName);
    fs.renameSync(uploadedFilePath, newFilePath);

    const decryptedFileName = `decrypted_audio_${user}_${timestamp}${fileExtension}`;

    try {
        const response = await axios.post('http://127.0.0.1:6000/decrypt-audio', {
            audio_name: newFileName,
            original_directory: dataDir,
            output_filename: decryptedFileName
        });

        console.log('Response from Flask server:', response.data);

        if (response.status === 200) {
            // Move the encrypted file to the archive directory
            const archiveFilePath = path.join(archiveDir, newFileName);
            fs.renameSync(newFilePath, archiveFilePath);
            console.log('Encrypted audio file moved to archive:', archiveFilePath);

            res.status(200).send(response.data);
        } else {
            res.status(500).send('Failed to decrypt audio on the Flask server.');
        }
    } catch (error) {
        console.error('Error decrypting audio on Flask server:', error.message);
        res.status(500).send('Error decrypting audio on the Flask server.');
    }
});

app.post('/downloadImage', (req, res) => {
    const filePath = req.body.imagePath;
    res.sendFile(path.resolve(filePath));
});

app.post('/downloadAudio', (req, res) => {
    const filePath = req.body.audioPath;
    res.sendFile(path.resolve(filePath));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
