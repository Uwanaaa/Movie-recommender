require('underscore') //retry download
const async = require('async')
const fs = require('node:fs')
const Recommender = require('./recommendClass')
const Rater = require('./raterClass')
const pg = require('pg')
pg.


class Similar {
    constructor() {
        this.db = fs.readFile('../data/data.json')
        this.recommender = Recommender
        this.likes = Rater
    }

    byUser(user, done) {
        this.db.findOne({ user: user }, (err, data) => {
            if (err) {
                return done(err)
            } else {
                return done(null, data)
            }
        })
    }

    updateSuggestion(user, done) {
        async.auto([
            likes = (done) => { this.likes.videoByUser, (user, done) },
            dislikes = (done) => { this.dislikes.videoByUser, (user, done) },

            (err, { likes, dislikes }) => {
                if (err) {
                    return done(err)
                }

                videoRate = _.flatten([likes, dislikes])
                async.map(videoRate, (video, done) => {
                    async.map[
                        this.engine.likes,
                        this.engine.dislikes
                    ], (rate = new Rater(), done) => {
                        rate.userByVideo(item, done)
                        done
                    }, (err, others) => {
                        if (err) {
                            return done(err)
                        }
                        others = _.without(_.unique(_.flatten(likes, dislikes)), user)
                        this.db.delete({ user: user }, (err) => {
                            return done(err)
                        })
                        async.map(others, (other, err) => {
                            async.auto([
                                otherLike = (done) => { this.engine.likes.videoByUser(other, done) },
                                otherDislike = (done) => { this.engine.dislikes.videoByUser(other, done) },
                                (err, { otherLike, otherDislike }) => {
                                    if (err) {
                                        return done(err)
                                    }
                                    done(err, {
                                        user: other,
                                        similarity: (_.intersection(likes, otherLike).length + (_.intersection(dislikes, otherDislike)).length - _.intersection(dislikes, otherLike).length - _.intersection(likes, otherDislike).length) / _.union(likes, dislikes, otherDislike, otherLike).length
                                    })
                                },

                                (err, others) => {
                                    if (err) {
                                        return next(err)
                                    }
                                    this.db.insert({
                                        user: user,
                                        others: others
                                    })
                                    done()
                                }
                            ])
                        })
                    }
                })
            }
        ])
    }
}
module.exports = Similar