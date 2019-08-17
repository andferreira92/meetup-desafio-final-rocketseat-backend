import Meetup from '../models/Meetupp';

class ScheduleController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { user_id: req.userId } });

    return res.json(meetups);
  }
}

export default new ScheduleController();
