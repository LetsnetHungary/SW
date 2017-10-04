var express = require('express'),
    router = express.Router(),
    preRender = require('.././preRender')()

router.get('/', function(req, res) {
    preRender.render({
        res: res,
        view: {
            view: 'Categories',
            headers : ['header'],
            footers: ['footer']
        },
        data: {},
        callback: () => {}
    })

})

router.get('/check', function(req, res) {

    console.log(req.session)

})

module.exports = router
