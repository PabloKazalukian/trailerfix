import contentRepository from '../repositories/content.repository.js';
import userContentRepository from '../repositories/userContent.repository.js';
import { serializeUserContent } from '../utils/serializers.js';

const STATUSES = ['WATCHED', 'WATCHLIST'];

async function list(req, res) {
  const where = {};

  if (req.query.status !== undefined) {
    const status = String(req.query.status).trim().toUpperCase();

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Datos invalidos',
        details: [`status debe ser uno de: ${STATUSES.join(', ')}`],
      });
    }

    where.status = status;
  }

  const entries = await userContentRepository.findByUser(req.user.id, where);
  return res.json(entries.map(serializeUserContent));
}

async function create(req, res) {
  const { contentId, status } = req.body;
  const contentExists = await contentRepository.exists(contentId);

  if (!contentExists) {
    return res.status(404).json({ error: 'Contenido no encontrado' });
  }

  const existing = await userContentRepository.findOne(
    req.user.id,
    contentId,
  );

  if (existing) {
    return res.status(409).json({
      error: 'El contenido ya esta en la lista del usuario',
    });
  }

  const watchedAt = status === 'WATCHED' ? new Date() : null;

  await userContentRepository.create({
    userId: req.user.id,
    contentId,
    status,
    watchedAt,
  });

  const entry = await userContentRepository.findOneWithContent(
    req.user.id,
    contentId,
  );

  return res.status(201).json(serializeUserContent(entry));
}

async function update(req, res) {
  const entry = await userContentRepository.findOne(
    req.user.id,
    req.params.contentId,
  );

  if (!entry) {
    return res.status(404).json({
      error: 'El contenido no esta en la lista del usuario',
    });
  }

  const { status } = req.body;
  const watchedAt =
    status === 'WATCHED' ? entry.watchedAt ?? new Date() : null;

  await userContentRepository.update(entry, { status, watchedAt });

  const updated = await userContentRepository.findOneWithContent(
    req.user.id,
    req.params.contentId,
  );

  return res.json(serializeUserContent(updated));
}

async function remove(req, res) {
  const entry = await userContentRepository.findOne(
    req.user.id,
    req.params.contentId,
  );

  if (!entry) {
    return res.status(404).json({
      error: 'El contenido no esta en la lista del usuario',
    });
  }

  await userContentRepository.delete(entry);
  return res.status(204).end();
}

export default { list, create, update, remove };
