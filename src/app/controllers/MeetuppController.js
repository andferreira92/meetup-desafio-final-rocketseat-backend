import * as Yup from 'yup';
import Meetupp from '../models/Meetupp';

class MeetuppController {
  async index(req, res) {
    /**
     * validações com Yup
     */
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }

    const { title, description, location, date, banner_id } = req.body;

    return res.json({
      title,
      description,
      location,
      date,
      banner_id,
    });
  }
}
export default new MeetuppController();
