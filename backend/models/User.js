import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['User', 'Developer', 'Admin'],
    default: 'User'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
