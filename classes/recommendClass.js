const async = require('async')
const Rater = require('./raterClass')
const Similar = require('./similarClass')
const Suggester = require('./suggestClass')

class Recommender {
    constructor() {
        this.likes = new Rater(this, 'likes')
        this.dislikes = new Rater(this, 'dislikes')
        this.similar = new Similar(this)
        this.suggester = new Suggester(this)
    }
}
module.exports = Recommender