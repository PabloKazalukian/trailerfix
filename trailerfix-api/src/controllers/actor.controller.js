import actorRepository from '../repositories/actor.repository.js';
import userContentRepository from '../repositories/userContent.repository.js';
import { serializeContent, serializeContentList } from '../utils/serializers.js';

async function list(req, res) {
  const search =
    req.query.search === undefined ? '' : String(req.query.search).trim();
  const actors = await actorRepository.findAll(search || undefined);
  return res.json(actors);
}

async function getById(req, res) {
  const actor = await actorRepository.findById(req.params.id);

  if (!actor) {
    return res.status(404).json({ error: 'Actor no encontrado' });
  }

  return res.json(actor);
}

async function getContentsByActor(req, res) {
  const actor = await actorRepository.findById(req.params.id);

  if (!actor) {
    return res.status(404).json({ error: 'Actor no encontrado' });
  }

  const contents = await actorRepository.findContentsByActor(req.params.id);
  const userId = req.user?.id;
  const serialized = await serializeContentList(contents, userId, userContentRepository);
  return res.json(serialized);
}

async function create(req, res) {
  const actor = await actorRepository.create(req.body);
  return res.status(201).json(actor);
}

async function update(req, res) {
  const actor = await actorRepository.findById(req.params.id);

  if (!actor) {
    return res.status(404).json({ error: 'Actor no encontrado' });
  }

  const updated = await actorRepository.update(actor, req.body);
  return res.json(updated);
}

async function remove(req, res) {
  const actor = await actorRepository.findById(req.params.id);

  if (!actor) {
    return res.status(404).json({ error: 'Actor no encontrado' });
  }

  await actorRepository.delete(actor);
  return res.json({ message: 'Se borró el actor satisfactoriamente.' });
}

export default { list, getById, getContentsByActor, create, update, remove };
