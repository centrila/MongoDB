const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite  => {
        if (favorite) { 
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id)){
                    favorite.campsites.push(fav._id)
                }
            });
            favorite.save()
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({user:req.user._id, campsites:req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } )
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   Favorite.findOneAndRemove({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            console.log("Favorite deleted");
            res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    } else {
        res.setHeader("Content-Type", "text/plain");
        res.end("You do not have any favorites to deleted.");
    }
})
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites");
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne(req.params.favoriteId)
    .then((favorite) => {
        if(!favorite.campsite.includes(req.params.campsiteId)) {
            favorite.campsite.push(req.params.campsiteId);
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite.campsite);
            })
            .catch((err) => next(err));
        } else{
            err = new Error("That campsite is already in the list of favorites!");
            err.status = 404;
            return next(err);
        }
    })
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove(req.params.campsiteId)
    .then((favorite) => {
        if (favorite) {
            console.log("Favorite deleted");
            res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }
        res.setHeader("Content-Type", "text/plain");
        res.end("You do not have any favorites to delete.");
})
    .catch(err => next(err));
});

module.exports = favoriteRouter;