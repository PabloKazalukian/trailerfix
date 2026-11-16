import { Season, Series } from '../database/models/index.js';

const seasonRepository = {
  findSeries(contentId) {
    return Series.findByPk(contentId);
  },

  findBySeries(contentId) {
    return Season.findAll({
      where: { seriesId: contentId },
      order: [['seasonNumber', 'ASC']],
    });
  },

  findById(id) {
    return Season.findByPk(id);
  },

  create(payload) {
    return Season.create(payload);
  },

  update(season, payload) {
    return season.update(payload);
  },

  delete(season) {
    return season.destroy();
  },
};

export default seasonRepository;
