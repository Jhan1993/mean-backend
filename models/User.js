const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
  tipoDocumento: {
    type: String,
    required: true
  },
  documento: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  try {
    // Solo aplica si la contraseña ha sido modificada o es nueva
    if (!this.isModified('password')) {
      return next();
    }
    // Hash de la contraseña con un salt de 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas durante el login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exportar el modelo de usuario
const User = mongoose.model('User', userSchema, 'customers');
module.exports = User;
