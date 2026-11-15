import { User } from '../database/models/index.js';

const userRepository = {
  findById(id) {
    return User.findByPk(id);
  },

  findByUsername(username) {
    return User.findOne({ where: { username } });
  },

  findByUsernameWithPassword(username) {
    return User.scope('withPassword').findOne({ where: { username } });
  },

  create({ username, name, password }) {
    return User.create({ username, name, password });
  },
};

export default userRepository;
