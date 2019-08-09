import Banners from '../models/Banners';

class BannersController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await Banners.create({
      name,
      path,
    });

    return res.json(file);
  }
}
export default new BannersController();
