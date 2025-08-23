const { Comment } = require('../../models');
const Joi = require('joi');

const addPost = (request, res) => {
    const validate = Joi.object({
        'title' : Joi.required().messages({
            'any.title' : 'Text is required'
        })
    });
    const {error} = validate.validate(request.body, {abortEarly: false});
    if (error) {
        return res.status(400).json({
            errors: error.details.map(e=> e.message)
        });
    }
    const {title} = request.body;
    const userId = request.user.id;
    Comment.create({
        'title' : title,
        'userId' : userId,
    });

    return res.status(200).json({
        'success' : 'You add comment success'
    });
}

module.exports = {addPost};