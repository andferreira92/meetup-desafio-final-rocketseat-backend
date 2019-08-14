import { Op } from 'sequelize';
import User from '../models/User';
import Meetupp from '../models/Meetupp';
import Subscription from '../models/Subscription';

import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },

      include: [
        {
          model: Meetupp,

          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },

          required: true,
        },
      ],

      order: [[Meetupp, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetupp.findByPk(req.params.meetupId, {
      include: [User],
    });
    /**
     * checka se o usuários esta se inscrevendo na própria meetup
     */
    if (meetup.user_id === req.userId) {
      return res

        .status(400)

        .json({ error: 'Você não pode se inscrever na sua própria meetup' });
    }
    /**
     * checka se a data da meetup já passou
     */
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Não é possível se inscrever em encontros passados' });
    }

    /**
     * verifica se o usuário esta se inscrevendo para meetups no mesmo dia e horário
     */
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },

      include: [
        {
          model: Meetupp,

          required: true,

          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res

        .status(400)

        .json({
          error: 'Não é possível se inscrever em dois encontros ao mesmo tempo',
        });
    }

    const subscription = await Subscription.create({
      user_id: user.id,

      meetup_id: meetup.id,
    });

    /**
     * pegar : nome do organizdor e email
     * pegar : nome do inscrito no meetup
     */
    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Nova Inscrição no seu meetup',
      template: 'inscription',
      context: {
        meetup: meetup.title,
        provider: meetup.User.name,
        user: user.name,
      },
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
