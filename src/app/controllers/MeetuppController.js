import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, subHours } from 'date-fns';
import Meetupp from '../models/Meetupp';
import User from '../models/User';
import File from '../models/File';
import Banners from '../models/Banners';

class MeetuppController {
  async index(req, res) {
    const { page } = req.query;

    const meetupps = await Meetupp.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'banner_id',
      ],
      limit: 20,
      offset: (page - 1) * 20,

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

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      banner_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }
    const user_id = req.userId;
    const meetup = await Meetupp.findByPk(req.params.id);
    /**
     *checka se o usuário logado pode alterar o meetup
     */
    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: 'Não é possível alterar meetups de outros usuários' });
    }

    /**
     * checka se a data da meetup já passou
     */
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Não é possível alterar encontros passados' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetupp = await Meetupp.findByPk(req.params.id);

    if (meetupp.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'você não tem permissão para apagar esse meetupp' });
    }

    const oneDayBefore = subHours(meetupp.date, 24);

    if (isBefore(oneDayBefore, new Date())) {
      return res.status(401).json({
        error: 'Você só pode cancelar um meetup com 24h de atendecedência',
      });
    }

    await meetupp.destroy();
    return res.send();
  }
}

export default new MeetuppController();
