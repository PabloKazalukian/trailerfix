import {
  Content,
  Genre,
  Movie,
  Series,
  UserContent,
} from '../database/models/index.js';

function contentIncludes() {
  return [
    {
      model: Content,
      as: 'content',
      include: [
        { model: Genre, as: 'genres', through: { attributes: [] } },
        { model: Movie, as: 'movie' },
        { model: Series, as: 'series' },
      ],
    },
  ];
}

const userContentRepository = {
  findByUser(userId, { status } = {}) {
    const where = { userId };

    if (status) {
      where.status = status;
    }

    return UserContent.findAll({
      where,
      include: contentIncludes(),
      order: [['updatedAt', 'DESC']],
    });
  },

  findOne(userId, contentId) {
    return UserContent.findOne({ where: { userId, contentId } });
  },

  findOneWithContent(userId, contentId) {
    return UserContent.findOne({
      where: { userId, contentId },
      include: contentIncludes(),
    });
  },

  create(payload) {
    return UserContent.create(payload);
  },

  update(entry, payload) {
    return entry.update(payload);
  },

  delete(entry) {
    return entry.destroy();
  },
};

export default userContentRepository;
