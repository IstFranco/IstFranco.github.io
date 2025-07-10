import React from 'react';
import './App.css';
import CargarImagen from './components/CargarImagen';

function App() {
    return (
        <div className="app">
        <h1>Conversor de Imágenes Analógicas a Digitales</h1>
        <CargarImagen />
        </div>
    );
}

export default App;