import actorRepository from '../repositories/actor.repository.js';

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
  return res.status(204).end();
}

export default { list, getById, create, update, remove };
