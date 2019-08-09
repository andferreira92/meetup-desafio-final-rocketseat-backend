import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    /**
     * validações com Yup
     */
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }

    /**
     * emailExists => Verifica se o email já esta cadastrado
     */
    const emailExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (emailExists) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async index(req, res) {
    const { id, name, email, avatar_id } = await User.findByPk(req.userId);

    return res.json({ id, name, email, avatar_id });
  }

  async update(req, res) {
    /**
     * validações com Yup
     */
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    /**
     * verifica se o email esta sendo alterado e se o novo email é diferente do antigo
     */

    if (email !== user.email) {
      const emailExists = await User.findOne({
        where: { email },
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    /**
     * Verificação referente as senhas
     */
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ erro: 'senhas não coincidem' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new UserController();
