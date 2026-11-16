import { Op } from 'sequelize';
import {
  Actor,
  Content,
  Movie,
  Series,
  Season,
  Genre,
} from '../database/models/index.js';

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

  findContentsByActor(actorId) {
    return Content.findAll({
      include: [
        { model: Movie, as: 'movie' },
        {
          model: Series,
          as: 'series',
          include: [{ model: Season, as: 'seasons' }],
        },
        {
          model: Genre,
          as: 'genres',
          through: { attributes: [] },
        },
        {
          model: Actor,
          as: 'actors',
          through: { attributes: ['characterName', 'creditOrder'] },
          where: { id: actorId },
        },
      ],
      order: [['title', 'ASC']],
    });
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
