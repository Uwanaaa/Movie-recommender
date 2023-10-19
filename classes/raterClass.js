const _ = require('underscore') //
const async = require('async') //
const Bourne = require('bourne') //install like this npm i @hapi/bourne
const Recommender = require('./recommendClass')

class Rater {
    constructor(kind) {
        this.kind = kind
        this.recommend = new Recommender()
        this.db = new Bourne(`../database-${this.kind}.json`)
    }

    find(user, video, done) {
        this.db.find({ user: user, video: video }, (err, res) => {
            if (err) {
                res.send(err)
                return done(null)
            }
            if (res.length > 0) {
                res.send("Nothing matches your query")
                return done(null)
            }
        })
    }

    delete(user, video, done) {
        this.db.delete({ user: user, video: video }, (res, err) => {
            if (err) {
                return done(err)
            }
            if (res.length > 0) {
                res.send("The user cannot be found")
                return done(null)
            }
            async.series([
                (done) => this.recommend.similar.u(user, done),
                (done) => this.recommend.suggester.update(user, done)
            ], done)
        })
    }

    add(user, video, done) {
        this.db.insert({ user: user, video: video }, (res, err) => {
            if (err) {
                return done(err)
            }
            if (res.length > 0) {
                res.send("No value was given")
                return done(null)
            }
            async.series(
                [
                    (done) => this.recommend.similars.update(user, done),
                    (done) => this.recommend.suggester.update(user, done)
                ],
                done
            )
        })
    }

    userByVideo(video, done) {
        this.db.findOne({ video: video }, (res, err, ratings) => {
            if (err) {
                return done(err)
            }
            if (ratings.length > 0) {
                res.send("Inaccurate Request").status(400)
                return done(null)
            }

            done(null, ratings.map((rating) => { rating.item }))
        })
    }

    videoByUser(user, done) {
        this.db.findOne({ user: user }, (res, err, likes) => {
            if (err) {
                return done(err)
            }
            if (likes.length > 0) {
                res.send("Inaccurate Request").status(400)
                return done(null)
            }

            done(null, likes.map((like) => { like.item }))
        })
    }
}

module.exports = Rater