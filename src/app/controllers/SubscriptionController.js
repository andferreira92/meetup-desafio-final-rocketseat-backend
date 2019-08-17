import { Op } from 'sequelize';
import User from '../models/User';
import Meetupp from '../models/Meetupp';
import Subscription from '../models/Subscription';

import InscriptionEmail from '../jobs/InscriptionMail';
import Queue from '../../lib/Queue';

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

    await Queue.add(InscriptionEmail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
