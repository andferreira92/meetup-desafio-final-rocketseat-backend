import Mail from '../../lib/Mail';

class InscriptionMail {
  get key() {
    return 'InscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

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
  }
}

export default new InscriptionMail();
