import 'underscore' //
const async = require('async') //
const fs = require('fs') //
const Rater = require('./raterClass')
const Recommender = require('./recommendClass')

//Change all the engine to Recommender

class Suggest {
    constructor(this, Recommender) {
        this.data = fs.readFile('../database-suggestion.json', err => {
            if (err) {
                console.error(err)
                return
            }
        })
    }

    suggestToUser(user, done) {
        this.db.findOne({ user: user }, (res, err, suggestions) => {
            if (err) {
                return done(err)
            }
            if (suggestions.length > 0) {
                res.send("Inaccurate Request").status(400)
                return done(null)
            }
            done(null, suggestions.map((suggestion) => { suggestion.item }))
        })
    }

    updateUserChoices(user, done) {
        this.recommender.byUser({ user: user }, (res, err) => {
            if (err) {
                return done(err)
            }
            async.auto([
                likes = (done) => { this.recommender.likes.videoByUser(user, done) },
                dislikes = (done) => { this.recommender.dislikes.videoByUser(user, done) },
                items = (done) => {
                    async.map(others, (other, done) => {
                        async.map([likes, dislikes],
                            (rater = new Rater(), done) => {
                                rater.videoByUser(other.user, done)
                                done(err, result)
                            },
                            (err, { likes, dislikes, video }) => {
                                if (err) {
                                    console.log(`Error: ${err}`)
                                    return done(err)
                                }
                                video = _.difference(_.uniq(_.flatten(video)), likes, dislikes)
                                this.db.delete({ user: user }, err => {
                                    if (err) {
                                        console.log(`Error: ${err}`)
                                        return done(err)
                                    }

                                    async.map(items, (video, done) => {
                                            async.auto({
                                                    likers: (done) => {
                                                        this.Rec.likes.userByVideo(video, done)
                                                    },
                                                    dislikers: (done) => {
                                                        this.engine.dislikes.userByVideo(video, done)
                                                    }
                                                }),
                                                (err, { likers, dislikers }) => {
                                                    if (err) {
                                                        return done(err)
                                                    }

                                                    let iterator = 0
                                                    for (const other of _.without(_.flatten({ likers, dislikers }), user)) {
                                                        item = _.findWhere(others, { user: other })
                                                        if (other) {
                                                            iterator += other.similarity
                                                        }
                                                    }
                                                    done(null, {
                                                        video: video,
                                                        weight: iterator / _.union(likers, dislikers).length
                                                    })
                                                }
                                        }),
                                        (err, suggestions) => {
                                            if (err) {
                                                return done(err)
                                            }
                                            this.data.insert({ user: user, suggestions: suggestions })
                                        }
                                })
                            },

                        )
                    })
                    if (err) {
                        console.log(`Error: ${err}`)
                    } else {
                        console.log(`Result: ${result}`)
                    }
                }
            ])
        })
    }
}

module.exports = Suggest