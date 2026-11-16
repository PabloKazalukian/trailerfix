import { Op } from 'sequelize';
import { Genre } from '../database/models/index.js';

const genreRepository = {
  findAll(search) {
    const where = search
      ? { name: { [Op.like]: `%${search}%` } }
      : undefined;

    return Genre.findAll({ where, order: [['name', 'ASC']] });
  },

  findById(id) {
    return Genre.findByPk(id);
  },

  findByIds(ids) {
    if (ids.length === 0) {
      return [];
    }

    return Genre.findAll({ where: { id: ids } });
  },

  create({ name }) {
    return Genre.create({ name });
  },

  update(genre, payload) {
    return genre.update(payload);
  },

  delete(genre) {
    return genre.destroy();
  },
};

export default genreRepository;
