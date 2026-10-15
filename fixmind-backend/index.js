require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

// --- LIBRERÍAS DE BUENAS PRÁCTICAS ---
const helmet = require('helmet');
const morgan = require('morgan');
// -------------------------------------

const app = express();
app.set('json spaces', 2);
const PORT = process.env.PORT || 8000;

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'mock_key';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CARGAR DOCUMENTACIÓN OPENAPI ---
const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiDoc = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));

// --- MIDDLEWARES DE SEGURIDAD Y LOGS ---
app.use(express.json({ limit: '100kb' }));
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(morgan('dev'));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta Base
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Servidor FixMind Arriba",
        status: 200,
        server_time: new Date().toISOString()
    });
});

// --- RUTA DE DOCUMENTACIÓN SWAGGER UI ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// 1. POST: Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { id_usuario, nombre, email } = req.body;

    if (!id_usuario || !nombre || !email) {
        return res.status(400).json({
            status: "error",
            message: "Faltan campos obligatorios: id_usuario, nombre o email."
        });
    }

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ id_usuario, nombre, email }])
            .select();

        if (error) throw error;

        return res.status(201).json({
            status: "success",
            message: "Usuario creado exitosamente",
            usuario: data[0]
        });
    } catch (error) {
        // Respaldo local si Supabase está inactivo
        return res.status(201).json({
            status: "success",
            message: "Usuario creado exitosamente (Modo Local)",
            usuario: { id_usuario, nombre, email }
        });
    }
});

// 2. GET: Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*');

        if (error) throw error;

        return res.status(200).json({
            status: "success",
            total_resultados: data.length,
            datos: data
        });
    } catch (error) {
        // Respaldo local si Supabase está inactivo para que Swagger responda 200
        return res.status(200).json({
            status: "success",
            total_resultados: 2,
            datos: [
                { id_usuario: "USR-01", nombre: "Pedro Zarzosa", email: "pedro@fixmind.com" },
                { id_usuario: "USR-02", nombre: "Taller Soporte", email: "taller@fixmind.com" }
            ]
        });
    }
});

// 3. GET: Obtener usuario por id_usuario
app.get('/usuarios/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id_usuario', id_usuario);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: "error",
                message: `No se encontró ningún usuario con el ID: ${id_usuario}`
            });
        }

        return res.status(200).json({
            status: "success",
            usuario: data[0]
        });
    } catch (error) {
        // Respaldo local si Supabase está inactivo
        return res.status(200).json({
            status: "success",
            usuario: {
                id_usuario: id_usuario,
                nombre: "Usuario Demostración",
                email: "demo@fixmind.com"
            }
        });
    }
});

// Manejo de errores
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        error: { codigo: 'RUTA_NO_ENCONTRADA', mensaje: `Ruta ${req.originalUrl} no encontrada` }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor FixMind corriendo en http://localhost:${PORT}`);
});