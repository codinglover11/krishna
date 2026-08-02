class BaseRepository {
  constructor(modelName) {
    this.modelName = modelName;
  }

  async findAll() {
    return [];
  }

  async findById(id) {
    return null;
  }
}

module.exports = BaseRepository;
