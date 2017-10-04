var mongoose = require('mongoose'),
    config = require('../.././config/config'),
    request = require('request'),
    gConfig = require('./gConfig'),
    uuidv4 = require('uuid-v4')


module.exports = () => {
    
    var insession = {}
    var incookies = {}

    let init = (session) => {
        return new Promise((fulfill, reject) => {
            insession = session
            fulfill(insession)
        })
    }

    let getFunctionFromServices = (fname, serviceman) => {
        return new Promise((fulfill, reject) => {
            let sfname = '@' + fname
            mongoose.connect('mongodb://' + config.database.user + ':' + config.database.passwd + config.database.url)
            let Services = require('../.././Helpers/Schemas/serviceSchema')
            Services.findOne({ serviceman: serviceman, functions: { $elemMatch: { name: sfname }}}, "functions", (err, document) => {
                if(err || err != null) {
                    reject({error: true, message: 'Hiba a function lekérése közben!', realmessage: err})
                } 
                else if(document == null) {
                    reject({error: true, message: 'Nem található a function (' + sfname + ') !'})
                }
                else {
                    document.functions.forEach((func) => {
                        if(func.name == sfname) {
                            fulfill({error: false, func: func})
                        }
                    })
                }
            })
        })
    }

    let checkFunction = (fname, serviceman) => {
        return new Promise((fulfill, reject) => {
            let URL = gConfig.functionCheck + gConfig.appid
            
            getFunctionFromServices(fname, serviceman)
            .then((func) => {
                request.post({
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    url: URL,
                    form: {
                        uniquekey: insession.gLogin.logged_user,
                        functionid: func.functionid
                    }
                },
                (err, res, body) => {
                    fulfill(res)
                })
            })
            .catch((err) => {
                reject(err)
            })
        })
    }

    /* -------- 0 -------- */

    var model = {}

    model.init = init

    //model.getFunction = getFunctionFromServices
    model.checkFunction = checkFunction

    return model
    
}