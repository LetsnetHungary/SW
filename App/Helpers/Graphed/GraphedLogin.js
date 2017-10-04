var request = require('request'),
    gConfig = require('./gConfig'),
    uuidv4 = require('uuid-v4')

module.exports = () => {

    var insession = {}
    var incookies = {}

    var init = (session) => {
        return new Promise((fulfill, reject) => {
            insession = session
            fulfill(insession)
        })
    }

    var checkLoginSession = () => {
        return  ( insession.gLogin === 'undefined' || insession.gLogin == null ) ? false : true;
    }

    var login = (gLogin) => {

        return new Promise((fulfill, reject) => {

            let URL = gConfig.loginURL + gConfig.appid
            
            if(!checkLoginSession()) {
                request.post({
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    url: URL,
                    form: {
                        uniquekey: uuidv4(),
                        email: gLogin.email, 
                        password: gLogin.password,
                        fingerprint: gLogin.fingerprint,
                        lalo: gLogin.lalo,
                        keepmeloggedin: gLogin.keepmeloggedin
                    }
                },
                (err, res, body) => {
                    if(err) {
                        /* IF REQUEST ERROR */
                        reject({error: true, message: 'Hiba a bejelentkezés közben (g)!'})
                    }

                    body = JSON.parse(body)
                    if(body.error) {      
                        reject({error: true, message: body.message, email: gLogin.email})
                    }
                    else {
                        fulfill({error: false, message: 'Sikeres bejelentkezés!', gLogin: {body}})
                    }
                })
            }
            else {
                reject({error: true, message: 'Már be van jelentkezve!'})
            }
        })
    }

    var checkReal = (gLogin) => {

        return new Promise((fulfill, reject) => {

            if(gLogin.active != 'undefined' && gLogin.active != null && gLogin.active == "no") {
                fulfill({error: false, message: "Sikeresen bejelentkezett!", gLogin: {uniquekey: "activenouniquekey"}})
            }

            if(insession.gLogin === 'undefined' || insession.gLogin == null) {
                reject({error: true, message: 'Nincsenek megfelelő adatok!'})
            }
            else {
                gLogin.logged_user = insession.gLogin.logged_user === 'undefined' || insession.gLogin.logged_user == null ? 'EeeE' : insession.gLogin.logged_user /* 'testerror' */
                gLogin.fingerprint = insession.gLogin.fingerprint === 'undefined' || insession.gLogin.fingerprint == null ? 'EeeE' : insession.gLogin.fingerprint /* {logged_in: false, uniqekey: ****} */
                gLogin.lalo = 'EeeE;EeeE'

                let URL = gConfig.checkIfLoggedInURL + gConfig.appid
        
                request.post({
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    url: URL,
                    form: {
                        uniquekey: gLogin.logged_user,
                        fingerprint: gLogin.fingerprint,
                        lalo: gLogin.lalo
                    }
                },
                (err, res, body) => {
                    if(err) {
                        reject({error: true, logged_id: false, message: 'Hiba az adatbázis kapcsolódásnál!'})
                    }
    
                    body = JSON.parse(body)
                    if(body.logged_in) {      
                        fulfill({error: false, message: 'Bejelentkezve!', gLogin: body})
                    }
                    else {
                        reject({error: true, message: 'Nincs bejelentkezve!', gLogin: body})
                    }
                })
            }
        })
    }

    var logout = (gLogin) => {

        return new Promise((fulfill, reject) => {

            let URL = gConfig.logoutURL + gConfig.appid
            
            request.post({
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                url: URL,
                form: {
                    uniquekey: gLogin.logged_user,
                    fingerprint: gLogin.fingerprint,
                    lalo: gLogin.lalo
                }
            },
            (err, res, body) => {
                if(err) {
                    reject({error: true, logged_id: false, message: 'Hiba az adatbázis kapcsolódásnál!'})
                }
    
                body = JSON.parse(body)
                if(body.error) {
                    reject({error: true, logged_id: false, message: 'Nincs ilyen belépett felhasználó!', gLogin: body})
                }
                else {
                    fulfill({error: false, message: 'Sikeres kilépés!', gLogin: body})
                }
            })
        })
    }

    /* --- MODEL VARS --- */

    var model = {}

    model.init = init

    model.login = login

    model.checkReal = checkReal

    model.logout = logout

    return model;

}