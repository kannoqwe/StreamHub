export const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                resolve(result);
                return;
            }

            reject(new Error('Unable to read file.'));
        };

        reader.onerror = () => {
            reject(new Error('Unable to read file.'));
        };

        reader.readAsDataURL(file);
    });
