import { useState } from 'react';
import Input from "./Input";

export default function RAG() {
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    const [divNumber, setDivNumber] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        } else {
            setSelectedFile(null);
            handleFlashMessage('Please select a valid file.', false, 3000);
        }
    };

    const handleFlashMessage = (text, success, time) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), time);
    };

    const handleEncryptImage = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('/encryptImage', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json(); // Parse JSON response
                    handleFlashMessage("Image encryption successful!", true, 3000);
                    handleDownloadEncryptedImage(responseData.encrypted_image);
                } else {
                    console.error('File moving failed.');
                    handleFlashMessage("File moving failed. Please try again", false, 3000);
                }
            } catch (error) {
                console.error('Error moving image:', error);
                handleFlashMessage(`Error moving image: ${error}`, false, 3000);
            }

        } else {
            handleFlashMessage('Please select an image.', false, 3000);
        }
    };

    const handleEncryptAudio = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('/encryptAudio', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json(); // Parse JSON response
                    handleFlashMessage("Audio encryption successful!", true, 3000);
                    handleDownloadEncryptedAudio(responseData.encrypted_audio);
                } else {
                    console.error('Audio encryption failed.');
                    handleFlashMessage("Audio encryption failed. Please try again", false, 3000);
                }
            } catch (error) {
                console.error('Error encrypting audio:', error);
                handleFlashMessage(`Error encrypting audio: ${error}`, false, 3000);
            }

        } else {
            handleFlashMessage('Please select an audio file.', false, 3000);
        }
    };

    const handleDecryptImage = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('/decryptImage', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json(); // Parse JSON response
                    handleFlashMessage("Image decryption successful!", true, 3000);
                    handleDownloadDecryptedImage(responseData.decrypted_image);
                } else {
                    console.error('Decryption failed.');
                    handleFlashMessage("Decryption failed. Please try again", false, 3000);
                }
            } catch (error) {
                console.error('Error decrypting image:', error);
                handleFlashMessage(`Error decrypting image: ${error}`, false, 3000);
            }

        } else {
            handleFlashMessage('Please select an image.', false, 3000);
        }
    };

    const handleDecryptAudio = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('/decryptAudio', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json(); // Parse JSON response
                    handleFlashMessage("Audio decryption successful!", true, 3000);
                    handleDownloadDecryptedAudio(responseData.decrypted_audio);
                } else {
                    console.error('Audio decryption failed.');
                    handleFlashMessage("Audio decryption failed. Please try again", false, 3000);
                }
            } catch (error) {
                console.error('Error decrypting audio:', error);
                handleFlashMessage(`Error decrypting audio: ${error}`, false, 3000);
            }

        } else {
            handleFlashMessage('Please select an audio file.', false, 3000);
        }
    };

    const handleDownloadEncryptedImage = async (imagePath) => {
        try {
            const response = await fetch('/downloadImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imagePath }),
            });

            if (!response.ok) {
                throw new Error('Error downloading image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'encrypted_image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
            handleFlashMessage('Error downloading image. Please try again', false, 3000);
        }
    };

    const handleDownloadEncryptedAudio = async (audioPath) => {
        try {
            const response = await fetch('/downloadAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audioPath }),
            });

            if (!response.ok) {
                throw new Error('Error downloading audio');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'encrypted_audio.mp3'; // Adjust the file name and extension as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading audio:', error);
            handleFlashMessage('Error downloading audio. Please try again', false, 3000);
        }
    };

    const handleDownloadDecryptedImage = async (imagePath) => {
        try {
            const response = await fetch('/downloadImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imagePath }),
            });

            if (!response.ok) {
                throw new Error('Error downloading image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'decrypted_image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
            handleFlashMessage('Error downloading image. Please try again', false, 3000);
        }
    };

    const handleDownloadDecryptedAudio = async (audioPath) => {
        try {
            const response = await fetch('/downloadAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audioPath }),
            });

            if (!response.ok) {
                throw new Error('Error downloading audio');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'decrypted_audio.mp3'; // Adjust the file name and extension as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading audio:', error);
            handleFlashMessage('Error downloading audio. Please try again', false, 3000);
        }
    };


    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-10";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleEncryptButton = () => {
        setDivNumber(1);
    };

    const handleDecryptButton = () => {
        setDivNumber(2);
    };

    const handleEncryptFile = async () => {
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType.startsWith('image/')) {
                handleEncryptImage();
            } else if (fileType.startsWith('audio/')) {
                handleEncryptAudio();
            } else {
                handleFlashMessage('Unsupported file type. Please select an image or audio file.', false, 3000);
            }
        } else {
            handleFlashMessage('Please select a file.', false, 3000);
        }
    };

    const handleDecryptFile = async () => {
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType.startsWith('image/')) {
                handleDecryptImage();
            } else if (fileType.startsWith('audio/')) {
                handleDecryptAudio();
            } else {
                handleFlashMessage('Unsupported file type. Please select an image or audio file.', false, 3000);
            }
        } else {
            handleFlashMessage('Please select a file.', false, 3000);
        }
    };


    return (
        <div>
            {flashMessage.success && (
                <div id="successFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {flashMessage.failure && (
                <div id="failFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleEncryptButton}
                    className={buttonClass}
                    style={{ width: '220px', height: '40px' }}>
                    Encrypt File
                </button>
                <button
                    onClick={handleDecryptButton}
                    className={buttonClass}
                    style={{ width: '220px', height: '40px' }}>
                    Decrypt File
                </button>
            </div>


            {divNumber === 1 && (
                <div>
                    <br /><br />
                    <h1 style={h1Style}>Select File (PNG, JPG, JPEG, MP3, WAV, or MPEG)</h1>

                    <Input
                        id="fileInput"
                        name="fileInput"
                        type="file"
                        handleChange={handleFileChange}
                        accept=".png,.jpg,.jpeg,.mp3,.wav,.mpeg"
                        isRequired={true}
                    />

                    <button
                        className={submitButtonClass}
                        onClick={handleEncryptFile}
                    >
                        Encrypt File
                    </button>
                </div>
            )}


            {divNumber === 2 && (
                <div>
                    <br /><br />
                    <h1 style={h1Style}>Select File (PNG, JPG, JPEG, MP3, WAV, or MPEG)</h1>

                    <Input
                        id="fileInput"
                        name="fileInput"
                        type="file"
                        handleChange={handleFileChange}
                        accept=".png,.jpg,.jpeg,.mp3,.wav,.mpeg"
                        isRequired={true}
                    />

                    <button
                        className={submitButtonClass}
                        onClick={handleDecryptFile}
                    >
                        Decrypt File
                    </button>
                </div>
            )}

        </div>
    )
}
