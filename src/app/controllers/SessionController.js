import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    /**
     * validações com Yup
     */
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'falha na validação dos dados' });
    }
    const { email, password } = req.body;

    /**
     * user => nesse caso verifica se o email passado existe no banco de dados
     */
    const user = await User.findOne({
      where: { email },
    });

    /**
     * verifica se o email existe
     */
    if (!user) {
      return res
        .status(401)
        .json({ error: `Usuário não encontrado para ${req.body.email}` });
    }

    /**
     * verifica se a senha esta certa ultilizando o metódo checkPassword do Model de User
     */
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'senha inválida' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
