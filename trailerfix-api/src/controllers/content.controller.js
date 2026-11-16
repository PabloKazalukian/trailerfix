import actorRepository from '../repositories/actor.repository.js';
import contentRepository from '../repositories/content.repository.js';
import genreRepository from '../repositories/genre.repository.js';
import userContentRepository from '../repositories/userContent.repository.js';
import { serializeContent, serializeContentList } from '../utils/serializers.js';

const TYPES = ['MOVIE', 'SERIES'];
const MIN_YEAR = 1888;
const MAX_YEAR = 2100;

function parseFilters(query) {
  const filters = {};
  const errors = [];

  if (query.type !== undefined) {
    const type = String(query.type).trim().toUpperCase();

    if (!TYPES.includes(type)) {
      errors.push('type debe ser MOVIE o SERIES');
    } else {
      filters.type = type;
    }
  }

  if (query.title !== undefined) {
    filters.title = String(query.title).trim();
  }

  if (query.genreId !== undefined) {
    const genreId = Number(query.genreId);

    if (!Number.isInteger(genreId) || genreId <= 0) {
      errors.push('genreId debe ser un entero positivo');
    } else {
      filters.genreId = genreId;
    }
  }

  if (query.genre !== undefined) {
    filters.genreName = String(query.genre).trim();
  }

  if (query.year !== undefined) {
    const year = Number(query.year);

    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      errors.push(`year debe ser un año entre ${MIN_YEAR} y ${MAX_YEAR}`);
    } else {
      filters.releaseYear = year;
    }
  }

  return { filters, errors };
}

async function list(req, res) {
  const { filters, errors } = parseFilters(req.query);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  const contents = await contentRepository.findAll(filters);
  const userId = req.user?.id;
  const serialized = await serializeContentList(contents, userId, userContentRepository);
  return res.json(serialized);
}

async function getById(req, res) {
  const content = await contentRepository.findById(req.params.id);

  if (!content) {
    return res.status(404).json({ error: 'Contenido no encontrado' });
  }

  const userId = req.user?.id;
  const serialized = userId
    ? await serializeContentList([content], userId, userContentRepository)
    : serializeContent(content);
  return res.json(Array.isArray(serialized) ? serialized[0] : serialized);
}

async function create(req, res) {
  const content = await contentRepository.create(req.body);
  return res.status(201).json(serializeContent(content));
}

async function update(req, res) {
  const content = await contentRepository.findById(req.params.id);

  if (!content) {
    return res.status(404).json({ error: 'Contenido no encontrado' });
  }

  if (req.body.type && req.body.type !== content.type) {
    return res.status(409).json({
      error: 'No se puede cambiar el tipo de contenido',
    });
  }

  if (
    content.type === 'MOVIE' &&
    (Object.hasOwn(req.body, 'endYear') || Object.hasOwn(req.body, 'status'))
  ) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['endYear y status solo aplican a SERIES'],
    });
  }

  if (
    content.type === 'SERIES' &&
    Object.hasOwn(req.body, 'durationMinutes')
  ) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: ['durationMinutes solo aplica a MOVIE'],
    });
  }

  const updated = await contentRepository.update(content, req.body);
  return res.json(serializeContent(updated));
}

async function remove(req, res) {
  const content = await contentRepository.findById(req.params.id);

  if (!content) {
    return res.status(404).json({ error: 'Contenido no encontrado' });
  }

  await contentRepository.delete(content);
  return res.json({ message: 'Se borró el contenido satisfactoriamente.' });
}

async function getContentOr404(req, res) {
  const content = await contentRepository.findById(req.params.id);

  if (!content) {
    res.status(404).json({ error: 'Contenido no encontrado' });
    return null;
  }

  return content;
}

async function replaceGenres(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const { genreIds } = req.body;
  const genres = await genreRepository.findByIds(genreIds);
  const foundIds = new Set(genres.map((genre) => genre.id));
  const missing = genreIds.filter((genreId) => !foundIds.has(genreId));

  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: [`Generos inexistentes: ${missing.join(', ')}`],
    });
  }

  await contentRepository.setGenres(content.id, genreIds);
  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function addGenre(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const genre = await genreRepository.findById(req.params.genreId);

  if (!genre) {
    return res.status(404).json({ error: 'Genero no encontrado' });
  }

  await contentRepository.addGenre(content.id, genre.id);
  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function removeGenre(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const removed = await contentRepository.removeGenre(
    content.id,
    req.params.genreId,
  );

  if (!removed) {
    return res.status(404).json({
      error: 'El contenido no tiene ese genero',
    });
  }

  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function replaceActors(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const { actors } = req.body;
  const actorIds = actors.map((actor) => actor.actorId);
  const foundActors = await actorRepository.findByIds(actorIds);
  const foundIds = new Set(foundActors.map((actor) => actor.id));
  const missing = actorIds.filter((actorId) => !foundIds.has(actorId));

  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: [`Actores inexistentes: ${missing.join(', ')}`],
    });
  }

  await contentRepository.setActors(content.id, actors);
  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function addActor(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const actor = await actorRepository.findById(req.body.actorId);

  if (!actor) {
    return res.status(404).json({ error: 'Actor no encontrado' });
  }

  await contentRepository.addActor({
    contentId: content.id,
    actorId: actor.id,
    characterName: req.body.characterName,
    creditOrder: req.body.creditOrder,
  });

  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function updateActor(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const entry = await contentRepository.findActorEntry(
    content.id,
    req.params.actorId,
  );

  if (!entry) {
    return res.status(404).json({
      error: 'El contenido no tiene ese actor',
    });
  }

  await contentRepository.updateActor(
    content.id,
    req.params.actorId,
    req.body,
  );

  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

async function removeActor(req, res) {
  const content = await getContentOr404(req, res);

  if (!content) {
    return undefined;
  }

  const removed = await contentRepository.removeActor(
    content.id,
    req.params.actorId,
  );

  if (!removed) {
    return res.status(404).json({
      error: 'El contenido no tiene ese actor',
    });
  }

  const updated = await contentRepository.findById(content.id);
  return res.json(serializeContent(updated));
}

export default {
  list,
  getById,
  create,
  update,
  remove,
  replaceGenres,
  addGenre,
  removeGenre,
  replaceActors,
  addActor,
  updateActor,
  removeActor,
};
