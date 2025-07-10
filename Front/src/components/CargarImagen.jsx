import React, { useState } from 'react';
import axios from 'axios';

export default function CargarImagen() {
    const [imgOriginal, setImgOriginal] = useState(null);
    const [imgProcesada, setImgProcesada] = useState(null);
    const [resol, setResol] = useState(100);
    const [bits, setBits] = useState(8);

    const [infoOriginal, setInfoOriginal] = useState(null);
    const [infoProcesada, setInfoProcesada] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImgOriginal(URL.createObjectURL(file));
            setInfoOriginal({
                sizeKB: (file.size / 1024).toFixed(2),
            });
        }
    };

    const procesar = async () => {
        const fileInput = document.getElementById('imagen');
        if (!fileInput.files[0]) return;

        const formData = new FormData();
        formData.append('imagen', fileInput.files[0]);
        formData.append('resol', resol);
        formData.append('bits', bits);

        try {
            const res = await axios.post('https://MatiBalda20.pythonanywhere.com/procesar', formData, {
                responseType: 'blob',
            });

            setImgProcesada(URL.createObjectURL(res.data));
            setInfoProcesada({
                sizeKB: res.headers['x-size-kb'],
            });
        } catch (err) {
            alert('Error al procesar la imagen');
            console.error(err);
        }
    };

    const descargarImagen = () => {
        if (imgProcesada) {
            const link = document.createElement('a');
            link.href = imgProcesada;
            link.download = 'imagen_digitalizada.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const descartarImagen = () => {
        setImgOriginal(null);
        setImgProcesada(null);
        setInfoOriginal(null);
        setInfoProcesada(null);
        document.getElementById('imagen').value = '';
    };

    return (
        <div>
            <input type="file" id="imagen" onChange={handleFileChange} />

            <div>
                <select onChange={(e) => setResol(Number(e.target.value))}>
                    <option value="100">100x100</option>
                    <option value="250">250x250</option>
                    <option value="500">500x500</option>
                </select>
                <select onChange={(e) => setBits(Number(e.target.value))}>
                    <option value="8">8 bits</option>
                    <option value="2">2 bits</option>
                    <option value="1">1 bit</option>
                </select>
            </div>

            <button onClick={procesar} className="btn-comprimir">Comprimir</button>

            <div className="image-container">
                {imgOriginal && (
                    <div className="image-box">
                        <p>Imagen original</p>
                        <img src={imgOriginal} />
                        {infoOriginal && (
                            <p>{infoOriginal.sizeKB} KB</p>
                        )}
                    </div>
                )}
                {imgProcesada && (
                    <div className="image-box">
                        <p>Imagen digitalizada</p>
                        <img src={imgProcesada} />
                        {infoProcesada && (
                            <p>{infoProcesada.sizeKB} KB</p>
                        )}
                    </div>
                )}
            </div>

            {imgProcesada && (
                <div>
                    <button onClick={descargarImagen} className="btn-descargar">Descargar</button>
                    <button onClick={descartarImagen} className="btn-descartar">Descartar imagen</button>
                </div>
            )}
        </div>
    );
}
