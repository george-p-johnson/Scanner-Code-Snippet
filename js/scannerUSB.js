        let port;
        let reader;

        document.getElementById('connect').addEventListener('click', async () => {
            try {
                // Request the serial port
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 115200 }); // Set baud rate (check your scanner's documentation)

                document.getElementById('status').textContent = 'Scanner connected';

                const decoder = new TextDecoderStream();
                const inputDone = port.readable.pipeTo(decoder.writable);
                const inputStream = decoder.readable;

                reader = inputStream.getReader();
                readLoop();

            } catch (error) {
                console.error('Error:', error);
                document.getElementById('status').textContent = 'Failed to connect scanner';
            }
        });

        async function readLoop() {
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        // Allow the serial port to be closed cleanly
                        console.log('Reader closed');
                        break;
                    }
                    if (value) {
                        // Parse the QR code data
                        document.getElementById('output').textContent += value;
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                reader.releaseLock();
            }
        }

        // Disconnect and close the port when done
        async function disconnect() {
            if (reader) {
                await reader.cancel();
                await reader.releaseLock();
            }
            if (port) {
                await port.close();
            }
            document.getElementById('status').textContent = 'Scanner disconnected';
        }

        window.addEventListener('beforeunload', disconnect);
