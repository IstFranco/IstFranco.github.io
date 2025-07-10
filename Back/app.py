from flask import Flask, request, send_file
from flask_cors import CORS 
from PIL import Image
import numpy as np
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers=["X-Width", "X-Height", "X-Size-KB"])

@app.route('/procesar', methods=['POST'])
def procesar_imagen():
    try:
        # Leer archivo e inputs
        file = request.files['imagen']
        resol = int(request.form['resol'])
        bits = int(request.form['bits'])

        # Abrir imagen original
        img = Image.open(file.stream)
        img = img.convert("RGB")

        # Redimensionar manteniendo proporciones
        ancho_orig, alto_orig = img.size
        if ancho_orig >= alto_orig:
            nuevo_ancho = resol
            nuevo_alto = int((resol / ancho_orig) * alto_orig)
        else:
            nuevo_alto = resol
            nuevo_ancho = int((resol / alto_orig) * ancho_orig)

        img = img.resize((nuevo_ancho, nuevo_alto))

        # Cuantización según profundidad de bits
        img_np = np.array(img)

        if bits == 1:
            # Blanco y negro real (escala de grises + umbral)
            gray = np.dot(img_np[...,:3], [0.299, 0.587, 0.114])
            bw = (gray > 128).astype(np.uint8) * 255
            img_np = np.stack([bw, bw, bw], axis=-1)

        elif bits == 2:
            # Solo 1 bit por canal (8 colores posibles)
            img_np = img_np >> 7
            img_np = img_np << 7

        elif bits == 8:
            # No modificar (mantener calidad original)
            pass

        else:
            # Cuantización genérica (ej: bits = 4, 6, etc.)
            img_np = img_np >> (8 - bits)
            img_np = img_np << (8 - bits)

        img_np = img_np.astype(np.uint8)

        # Guardar en memoria
        img_result = Image.fromarray(img_np.astype(np.uint8))
        output = io.BytesIO()
        img_result.save(output, format='PNG')
        output.seek(0)

        # Calcular tamaño y resolución
        tamano_bytes = output.getbuffer().nbytes
        ancho_result, alto_result = img_result.size

        # Enviar con headers extra
        response = send_file(output, mimetype='image/png')
        response.headers['X-Width'] = str(ancho_result)
        response.headers['X-Height'] = str(alto_result)
        response.headers['X-Size-KB'] = str(round(tamano_bytes / 1024, 2))
        return response

    except Exception as e:
        print("⚠️ ERROR al procesar la imagen:", e)
        return "Error interno al procesar la imagen", 500

if __name__ == '__main__':
    app.run(debug=True)