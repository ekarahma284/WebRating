export default class BaseController {
  constructor(service) {
    this.service = service;
  }

  findAll = async (req, res) => {
    const result = await this.service.findAll();
    res.json(result.rows);
  };

  findById = async (req, res) => {
    const result = await this.service.findById(req.params.id);
    result ? res.json(result) : res.status(404).json({ message: "Not found" });
  };

  create = async (req, res) => {
    const created = await this.service.create(req.body, Object.keys(req.body));
    res.json(created);
  };

  update = async (req, res) => {
    const updated = await this.service.update(req.params.id, req.body, Object.keys(req.body));
    res.json(updated);
  };

  delete = async (req, res) => {
    await this.service.delete(req.params.id);
    res.json({ message: "Deleted" });
  };
}
