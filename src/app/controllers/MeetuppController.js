import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Meetupp from '../models/Meetupp';
import User from '../models/User';
import File from '../models/File';
import Banners from '../models/Banners';

class MeetuppController {
  async index(req, res) {
    const meetupps = await Meetupp.findAll({
      order: ['date'],
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'banner_id',
      ],

      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
            },
          ],
        },
        {
          model: Banners,
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(meetupps);
  }

  async store(req, res) {
    /**
     * validações com Yup
     */
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date(),
    });

    /**
     * validações de data
     */

    const hourStart = startOfHour(parseISO(req.body.date));
    /**
     * verifica se a data já passou
     */
    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'esta data já passou e não pode ser usada' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }

    const user_id = req.userId;

    const meetupp = await Meetupp.create({
      ...req.body,

      user_id,
    });

    return res.json(meetupp);
  }
}
export default new MeetuppController();
