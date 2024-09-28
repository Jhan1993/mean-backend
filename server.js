const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
const User = require('./models/User');

app.use(cors());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/registered_users')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar con MongoDB', err));
  
// Middleware para parsear JSON en las solicitudes
app.use(express.json()); 

    // Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola, bienvenido al proyecto MEAN!');
});

app.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada (encriptada)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Si todo está bien, enviar un mensaje de éxito
    res.status(200).json({ message: 'Login exitoso', userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para registrar usuarios
app.post('/register', async (req, res) => {
  try {
    const { tipoDocumento, documento, nombre, apellido, correo, password } = req.body;

    // Verificar que todos los campos existen
    if (!tipoDocumento || !documento || !nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Crear un nuevo usuario
    const newUser = new User({ tipoDocumento, documento, nombre, apellido, correo, password });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Responder con JSON cuando el usuario sea creado correctamente
    return res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

  //ruta POST que manejará el proceso de login
  app.post('/login', async (req, res) => {
    try {
      const { correo, contraseña } = req.body;
      
      // Buscar al usuario por su correo
      const user = await User.findOne({ correo });
      if (!user) {
        return res.status(400).send('Usuario no encontrado');
      }
  
      // Comparar la contraseña
      const isMatch = await user.comparePassword(contraseña);
      if (!isMatch) {
        return res.status(400).send('Contraseña incorrecta');
      }
  
      // Si todo está bien, retornar un mensaje de éxito
      res.status(200).send('Login exitoso');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error en el servidor');
    }
  });  

  // Ruta para actualizar usuarios
  app.put('/users/:id', async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del usuario de los parámetros de la URL
      const { tipoDocumento, documento, nombre, apellido, correo, password } = req.body; // Datos a actualizar
  
      // Buscar el usuario por ID y actualizar los campos
      const updatedUser = await User.findByIdAndUpdate(id, {
        tipoDocumento,
        documento,
        nombre,
        apellido,
        correo,
        password
      }, { new: true });
  
      // Si el usuario no se encuentra, enviar error
      if (!updatedUser) {
        return res.status(404).send('Usuario no encontrado');
      }
  
      res.status(200).send('Usuario actualizado exitosamente');
    } catch (error) {
      console.error(error);
      res.status(400).send('Error al actualizar usuario: ' + error.message);
    }
  });

  // Ruta para obtener todos los usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Obtener todos los usuarios
    res.status(200).json(users);     // Enviar la lista de usuarios como JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});


// Servidor escuchando
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
