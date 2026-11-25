import { Op } from 'sequelize';
import {
  Actor,
  Content,
  ContentActor,
  ContentGenre,
  Genre,
  Movie,
  Season,
  Series,
  sequelize,
} from '../database/models/index.js';

function buildIncludes({ genreId, genreName } = {}) {
  const genreWhere = {};

  if (genreId) {
    genreWhere.id = genreId;
  }

  if (genreName) {
    genreWhere.name = genreName;
  }

  const hasGenreFilter = Object.keys(genreWhere).length > 0;

  return [
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
      ...(hasGenreFilter ? { where: genreWhere, required: true } : {}),
    },
    {
      model: Actor,
      as: 'actors',
      through: { attributes: ['characterName', 'creditOrder'] },
    },
  ];
}

const contentRepository = {
  findAll({ type, title, releaseYear, genreId, genreName } = {}) {
    const where = {};

    if (type) {
      where.type = type;
    }

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }

    if (releaseYear) {
      where.releaseYear = releaseYear;
    }

    return Content.findAll({
      where,
      include: buildIncludes({ genreId, genreName }),
      order: [['title', 'ASC']],
    });
  },

  findById(id) {
    return Content.findByPk(id, { include: buildIncludes() });
  },

  async exists(id) {
    const count = await Content.count({ where: { id } });
    return count > 0;
  },

  create({
    title,
    description,
    releaseYear,
    type,
    durationMinutes,
    endYear,
    status,
    // Extended fields
    trailerUrl,
    posterUrl,
    backdropUrl,
    rating,
    voteCount,
    imdbId,
    tmdbId,
    originalLanguage,
    originCountry,
    // Movie specific
    budget,
    revenue,
    originalTitle,
    runtimeMinutes,
    // Series specific
    numberOfSeasons,
    numberOfEpisodes,
    firstAirDate,
    lastAirDate,
    networks,
    inProduction,
  }) {
    return sequelize.transaction(async (transaction) => {
      const content = await Content.create(
        {
          title,
          description,
          releaseYear,
          type,
          trailerUrl,
          posterUrl,
          backdropUrl,
          rating,
          voteCount,
          imdbId,
          tmdbId,
          originalLanguage,
          originCountry,
        },
        { transaction },
      );

      if (type === 'MOVIE') {
        await Movie.create(
          {
            contentId: content.id,
            durationMinutes,
            budget,
            revenue,
            originalTitle,
            runtimeMinutes,
          },
          { transaction },
        );
      } else {
        await Series.create(
          {
            contentId: content.id,
            endYear,
            status,
            numberOfSeasons,
            numberOfEpisodes,
            firstAirDate,
            lastAirDate,
            networks,
            inProduction,
          },
          { transaction },
        );
      }

      return Content.findByPk(content.id, {
        include: buildIncludes(),
        transaction,
      });
    });
  },

  update(content, payload) {
    return sequelize.transaction(async (transaction) => {
      const {
        durationMinutes,
        endYear,
        status,
        // Extended fields
        trailerUrl,
        posterUrl,
        backdropUrl,
        rating,
        voteCount,
        imdbId,
        tmdbId,
        originalLanguage,
        originCountry,
        // Movie specific
        budget,
        revenue,
        originalTitle,
        runtimeMinutes,
        // Series specific
        numberOfSeasons,
        numberOfEpisodes,
        firstAirDate,
        lastAirDate,
        networks,
        inProduction,
        ...contentPayload
      } = payload;

      // Update content fields
      await content.update(
        {
          ...contentPayload,
          trailerUrl,
          posterUrl,
          backdropUrl,
          rating,
          voteCount,
          imdbId,
          tmdbId,
          originalLanguage,
          originCountry,
        },
        { transaction },
      );

      if (content.type === 'MOVIE') {
        const moviePayload = {};
        if (durationMinutes !== undefined) moviePayload.durationMinutes = durationMinutes;
        if (budget !== undefined) moviePayload.budget = budget;
        if (revenue !== undefined) moviePayload.revenue = revenue;
        if (originalTitle !== undefined) moviePayload.originalTitle = originalTitle;
        if (runtimeMinutes !== undefined) moviePayload.runtimeMinutes = runtimeMinutes;

        if (Object.keys(moviePayload).length > 0) {
          await Movie.update(moviePayload, {
            where: { contentId: content.id },
            transaction,
          });
        }
      } else {
        const seriesPayload = {};

        if (endYear !== undefined) seriesPayload.endYear = endYear;
        if (status !== undefined) seriesPayload.status = status;
        if (numberOfSeasons !== undefined) seriesPayload.numberOfSeasons = numberOfSeasons;
        if (numberOfEpisodes !== undefined) seriesPayload.numberOfEpisodes = numberOfEpisodes;
        if (firstAirDate !== undefined) seriesPayload.firstAirDate = firstAirDate;
        if (lastAirDate !== undefined) seriesPayload.lastAirDate = lastAirDate;
        if (networks !== undefined) seriesPayload.networks = networks;
        if (inProduction !== undefined) seriesPayload.inProduction = inProduction;

        if (Object.keys(seriesPayload).length > 0) {
          await Series.update(seriesPayload, {
            where: { contentId: content.id },
            transaction,
          });
        }
      }

      return Content.findByPk(content.id, {
        include: buildIncludes(),
        transaction,
      });
    });
  },

  delete(content) {
    return content.destroy();
  },

  setGenres(contentId, genreIds) {
    return sequelize.transaction(async (transaction) => {
      await ContentGenre.destroy({ where: { contentId }, transaction });

      if (genreIds.length > 0) {
        await ContentGenre.bulkCreate(
          genreIds.map((genreId) => ({ contentId, genreId })),
          { transaction },
        );
      }
    });
  },

  addGenre(contentId, genreId) {
    return ContentGenre.create({ contentId, genreId });
  },

  removeGenre(contentId, genreId) {
    return ContentGenre.destroy({ where: { contentId, genreId } });
  },

  setActors(contentId, actors) {
    return sequelize.transaction(async (transaction) => {
      await ContentActor.destroy({ where: { contentId }, transaction });

      if (actors.length > 0) {
        await ContentActor.bulkCreate(
          actors.map((actor) => ({
            contentId,
            actorId: actor.actorId,
            characterName: actor.characterName,
            creditOrder: actor.creditOrder,
          })),
          { transaction },
        );
      }
    });
  },

  addActor({ contentId, actorId, characterName, creditOrder }) {
    return ContentActor.create({
      contentId,
      actorId,
      characterName,
      creditOrder,
    });
  },

  findActorEntry(contentId, actorId) {
    return ContentActor.findOne({ where: { contentId, actorId } });
  },

  updateActor(contentId, actorId, payload) {
    return ContentActor.update(payload, { where: { contentId, actorId } });
  },

  removeActor(contentId, actorId) {
    return ContentActor.destroy({ where: { contentId, actorId } });
  },
};

export default contentRepository;
