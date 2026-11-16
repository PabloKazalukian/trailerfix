import { Op } from 'sequelize';
import { Actor } from '../database/models/index.js';

const actorRepository = {
  findAll(search) {
    const where = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined;

    return Actor.findAll({
      where,
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
      ],
    });
  },

  findById(id) {
    return Actor.findByPk(id);
  },

  findByIds(ids) {
    if (ids.length === 0) {
      return [];
    }

    return Actor.findAll({ where: { id: ids } });
  },

  create({ firstName, lastName }) {
    return Actor.create({ firstName, lastName });
  },

  update(actor, payload) {
    return actor.update(payload);
  },

  delete(actor) {
    return actor.destroy();
  },
};

export default actorRepository;
